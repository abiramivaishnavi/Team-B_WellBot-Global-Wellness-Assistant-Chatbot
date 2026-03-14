from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from typing import Optional

from ..models.schemas import Feedback, FeedbackCreate
from ..supabase_client import get_supabase_client
from ..dependencies import get_optional_user_id


router = APIRouter()


@router.get("/stats")
def get_feedback_stats(user_id: Optional[str] = Depends(get_optional_user_id)):
    """Get average rating, total reviews, and satisfaction % across all users."""
    supabase = get_supabase_client()
    try:
        result = supabase.table("feedback").select("rating").execute()
        data = []
        if hasattr(result, "data") and result.data:
            data = result.data
        elif isinstance(result, dict) and "data" in result:
            data = result["data"] or []

        print(f"[Feedback Stats] rows fetched: {len(data)}, sample: {data[:2]}")

        if not data:
            return {"average_rating": 0, "total_reviews": 0, "satisfaction_pct": 0}

        ratings = [item.get("rating", 0) for item in data]
        total = len(ratings)
        avg = sum(ratings) / total
        positive = sum(1 for r in ratings if r >= 4)
        satisfaction = round((positive / total) * 100) if total else 0

        return {
            "average_rating": round(avg, 1),
            "total_reviews": total,
            "satisfaction_pct": satisfaction,
        }
    except Exception as e:
        print(f"Error fetching feedback stats: {e}")
        return {"average_rating": 0, "total_reviews": 0, "satisfaction_pct": 0}


@router.get("/community")
def get_community_reviews(limit: int = 10):
    """Return top positive reviews (rating >= 4) with user names, newest first."""
    supabase = get_supabase_client()
    try:
        result = (
            supabase.table("feedback")
            .select("id, user_id, rating, category, comment, created_at")
            .gte("rating", 4)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        data = []
        if hasattr(result, "data") and result.data:
            data = result.data
        elif isinstance(result, dict) and "data" in result:
            data = result["data"] or []

        # Filter out rows without a comment on the Python side too
        data = [r for r in data if r.get("comment")]

        if not data:
            return []

        # Collect user_ids to resolve names from profiles
        user_ids = list({r["user_id"] for r in data if r.get("user_id")})
        name_map = {}
        if user_ids:
            try:
                profiles_result = (
                    supabase.table("profiles")
                    .select("id, name")
                    .in_("id", user_ids)
                    .execute()
                )
                profiles_data = []
                if hasattr(profiles_result, "data") and profiles_result.data:
                    profiles_data = profiles_result.data
                elif isinstance(profiles_result, dict) and "data" in profiles_result:
                    profiles_data = profiles_result["data"] or []
                for p in profiles_data:
                    if p.get("name"):
                        name_map[p["id"]] = p["name"]
            except Exception as pe:
                print(f"Could not fetch profiles: {pe}")

        now = datetime.now(timezone.utc)
        reviews = []
        for r in data:
            uid = r.get("user_id")
            full_name = name_map.get(uid, "Anonymous") if uid else "Anonymous"
            # Build short display name: "First L."
            parts = full_name.strip().split()
            if len(parts) >= 2:
                display_name = f"{parts[0]} {parts[-1][0]}."
                avatar = f"{parts[0][0]}{parts[-1][0]}".upper()
            else:
                display_name = full_name or "Anonymous"
                avatar = (full_name[:2] if full_name else "AN").upper()

            # Compute relative time
            created_str = r.get("created_at", "")
            try:
                created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                delta = now - created_dt
                days = delta.days
                if days == 0:
                    time_label = "today"
                elif days == 1:
                    time_label = "1 day ago"
                elif days < 7:
                    time_label = f"{days} days ago"
                elif days < 14:
                    time_label = "1 week ago"
                elif days < 30:
                    time_label = f"{days // 7} weeks ago"
                elif days < 60:
                    time_label = "1 month ago"
                else:
                    time_label = f"{days // 30} months ago"
            except Exception:
                time_label = ""

            reviews.append({
                "id": r["id"],
                "name": display_name,
                "avatar": avatar,
                "rating": r["rating"],
                "category": r.get("category"),
                "comment": r["comment"],
                "time": time_label,
            })

        return reviews
    except Exception as e:
        print(f"Error fetching community reviews: {e}")
        return []


@router.post("/", response_model=Feedback)
def submit_feedback(payload: FeedbackCreate, user_id: Optional[str] = Depends(get_optional_user_id)):
    """
    Submits user feedback to the database with extensive logging for debugging.
    """
    print(f"\n[FEEDBACK POST] Received submission at {datetime.now()}")
    print(f"  - Payload: rating={payload.rating}, category={payload.category}, anonymous={payload.anonymous}")
    print(f"  - Authenticated user_id: {user_id}")
    
    supabase = get_supabase_client()

    data = {
        "rating": payload.rating,
        "category": payload.category,
        "comment": payload.comment,
    }

    if not payload.anonymous:
        if not user_id:
            print("  - ERROR: Submission marked as non-anonymous but user_id is missing.")
            raise HTTPException(status_code=401, detail="Authentication is required for non-anonymous feedback")
        data["user_id"] = user_id
        print(f"  - Adding user_id {user_id} to data object")
    else:
        print("  - Processing as ANONYMOUS feedback")

    try:
        print(f"  - Attempting database insert into 'feedback' table...")
        result = (
            supabase.table("feedback")
            .insert(data)
            .execute()
        )

        print(f"  - Supabase result returned. Success: {bool(result.data)}")
        
        rows = []
        if hasattr(result, "data") and result.data:
            rows = result.data
            print(f"  - Successfully inserted row with ID: {rows[0].get('id')}")
        elif isinstance(result, dict) and "data" in result:
            rows = result["data"] or []
            if rows:
                print(f"  - Successfully inserted row with ID: {rows[0].get('id')}")
            else:
                print("  - WARNING: Database returned empty rows list unexpectedly.")
        
        if not rows:
            print("  - ERROR: Database insert returned no data.")
            raise HTTPException(
                status_code=500, 
                detail="The database accepted the request but did not return the saved record. Please check table constraints."
            )

        return rows[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"  - CRITICAL DATABASE ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Database communication failure: {str(e)}"
        )
