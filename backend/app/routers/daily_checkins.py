import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from ..models.schemas import DailyCheckIn, DailyCheckInCreate
from ..supabase_client import get_supabase_client
from ..dependencies import get_user_id


router = APIRouter()


def _build_polyfill_data(data: dict) -> dict:
    """Strip columns that don't exist in DB and store them in notes as a polyfill."""
    polyfill = {
        "hydration_glasses": data.get("hydration_glasses"),
        "goals_json": data.get("goals_json"),
    }
    data = dict(data)
    data["notes"] = f"__POLYFILL__:{json.dumps(polyfill)}"
    data.pop("hydration_glasses", None)
    data.pop("goals_json", None)
    return data


@router.post("/", response_model=DailyCheckIn)
def upsert_daily_checkin(payload: DailyCheckInCreate, user_id: str = Depends(get_user_id)):
    print(f"\n[DAILY CHECK-IN] Upsert request for user {user_id} on {payload.date}")
    supabase = get_supabase_client()

    try:
        print(f"  - Checking for existing record on {payload.date}...")
        existing = (
            supabase.table("daily_check_ins")
            .select("id")
            .eq("user_id", user_id)
            .eq("date", payload.date.isoformat())
            .execute()
        )

        existing_id = None
        if existing and hasattr(existing, 'data') and existing.data and len(existing.data) > 0:
            existing_id = existing.data[0].get("id")
            print(f"  - Found existing record with ID: {existing_id}")

        data = payload.model_dump()
        data["user_id"] = user_id
        data["date"] = payload.date.isoformat()

        # Re-creating the original explicit string formatting for notes
        # because the frontend heavily relies on this regex
        if "notes" in data and not data["notes"]:
            data["notes"] = f"Water: {payload.hydration_glasses} glasses"
            # Optional: append goals info if needed by old frontends
            if payload.goals_json:
                completed = sum(1 for g in payload.goals_json if g.get("done"))
                data["notes"] += f"\nGoals: {completed}/{len(payload.goals_json)} completed."

        def _execute_op(op_fn):
            return op_fn(data)

        if existing_id:
            print(f"  - Attempting UPDATE for record {existing_id}...")
            result = _execute_op(lambda d: supabase.table("daily_check_ins").update(d).eq("id", existing_id).execute())
        else:
            print(f"  - Attempting INSERT for new record...")
            result = _execute_op(lambda d: supabase.table("daily_check_ins").insert(d).execute())

        print(f"  - Supabase operation result: {'Success' if getattr(result, 'data', None) else 'Empty/Failure'}")

        if not getattr(result, 'data', None):
            raise HTTPException(status_code=500, detail="Failed to save daily check-in")

        saved_row = result.data[0] if isinstance(result.data, list) else result.data
        return _process_row(saved_row)

    except HTTPException:
        raise
    except Exception as e:
        print(f"  - CRITICAL ERROR during daily check-in save: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/", response_model=list[DailyCheckIn])
def list_daily_checkins(
    user_id: str = Depends(get_user_id),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
):
    supabase = get_supabase_client()

    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=30)

    query = (
        supabase.table("daily_check_ins")
        .select("*")
        .eq("user_id", user_id)
        .gte("date", start_date.isoformat())
        .lte("date", end_date.isoformat())
        .order("date", desc=False)
    )

    result = query.execute()
    return [_process_row(row) for row in (getattr(result, 'data', []))]


def _process_row(row: dict) -> dict:
    """Decode polyfill data from 'notes' if dedicated columns are missing."""
    notes = row.get("notes", "")
    if notes and isinstance(notes, str) and notes.startswith("__POLYFILL__:"):
        try:
            payload = json.loads(notes.replace("__POLYFILL__:", "", 1))
            if not row.get("hydration_glasses"):
                row["hydration_glasses"] = payload.get("hydration_glasses", 0)
            if not row.get("goals_json"):
                row["goals_json"] = payload.get("goals_json", [])
        except Exception:
            pass
    return row

