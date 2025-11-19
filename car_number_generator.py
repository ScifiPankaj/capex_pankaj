"""Generate sequential CAR numbers using the database sequence ``CAR_SEQ``."""

from __future__ import annotations

from cdb.util import nextval


def generate_car_number() -> str:
    """Return the next 7-digit CAR number."""
    seq = nextval("CAR_SEQ")      # DB me already sequence hona chahiye
    return f"{int(seq):07d}"      # 0000001, 0000002, ...


__all__ = ["generate_car_number"]
