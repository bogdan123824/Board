import json
from typing import Optional, List, Any, Dict
from exceptions import BadRequestError


def safe_load_list_field(data_str: str, field_name: str = "list") -> list:
    if not data_str:
        return []
    
    try:
        if data_str.startswith('['):
            return json.loads(data_str)
        return [item.strip() for item in data_str.split(',') if item.strip()]
    except json.JSONDecodeError:
        raise BadRequestError(f"Invalid format for {field_name}")


def safe_dump_list_field(data_list: List[Any]) -> str:
    if not data_list:
        return "[]"
    return json.dumps(data_list)


def validate_resource_ownership(owner_id: int, current_user_id: int, resource_name: str):
    from exceptions import ForbiddenError
    
    if owner_id != current_user_id:
        raise ForbiddenError(f"You don't own this {resource_name}")


def check_resource_exists(resource: Optional[Any], resource_name: str):
    from exceptions import NotFoundError
    
    if not resource:
        raise NotFoundError(f"{resource_name} not found")


def check_resource_exists_or_forbidden(
    resource: Optional[Any], 
    owner_id: Optional[int],
    current_user_id: int,
    resource_name: str
):
    check_resource_exists(resource, resource_name)
    
    if owner_id and owner_id != current_user_id:
        raise ForbiddenError(f"You don't own this {resource_name}")


def check_authorization(is_authorized: bool, detail: str = "Not authorized"):
    from exceptions import ForbiddenError
    
    if not is_authorized:
        raise ForbiddenError(detail)
