# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from sqlalchemy import create_engine, MetaData, delete
from sqlalchemy.exc import SQLAlchemyError
import os
import re

app = Flask(__name__)

db_url = os.environ.get("DATABASE_URL", "sqlite:///evidence.db")
engine = create_engine(db_url, future=True)
metadata = MetaData()
metadata.reflect(bind=engine)

CASE_COLUMN_PATTERNS = [
    re.compile(r"^case[_\-]?id$", re.IGNORECASE),
    re.compile(r"^caseid$", re.IGNORECASE),
    re.compile(r"^id$", re.IGNORECASE),
    re.compile(r"^evidence[_\-]?id$", re.IGNORECASE),
    re.compile(r"case", re.IGNORECASE),
]


def find_case_column(table):
    for column in table.columns:
        name = column.name.lower()
        for pattern in CASE_COLUMN_PATTERNS:
            if pattern.search(name):
                return column
    return None


def find_delete_target(case_id):
    for table in metadata.sorted_tables:
        column = find_case_column(table)
        if not column:
            continue

        try:
            with engine.connect() as conn:
                stmt = delete(table).where(column == case_id)
                result = conn.execute(stmt)
                conn.commit()

                if result.rowcount > 0:
                    return table.name, column.name, result.rowcount
        except SQLAlchemyError:
            continue

    return None, None, 0


@app.route("/case/delete", methods=["POST"])
def case_delete():
    if not request.is_json:
        return jsonify(success=False, message="Expected JSON request."), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify(success=False, message="Invalid JSON payload."), 400

    case_id = data.get("caseId") or data.get("id") or data.get("case_id")
    if case_id is None or str(case_id).strip() == "":
        return jsonify(success=False, message="Missing caseId."), 400

    try:
        if isinstance(case_id, str) and case_id.isdigit():
            case_id = int(case_id)
    except ValueError:
        pass

    table_name, column_name, deleted = find_delete_target(case_id)
    if deleted == 0:
        return jsonify(success=False, message="No matching case found for deletion."), 404

    return jsonify(success=True, message="Case cleared successfully", table=table_name, column=column_name, deleted=deleted)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
