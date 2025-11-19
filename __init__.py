from cdb.objects import Object
from .car_number_generator import generate_car_number


class CarRequest(Object):
    __maps_to__ = "car_request"
    __classname__ = "car_request"

    @classmethod
    def Create(cls, **kwargs):
        """Ensure backend-generated sequential CAR number."""
        if not kwargs.get("car_no"):
            kwargs["car_no"] = generate_car_number()
        return super(CarRequest, cls).Create(**kwargs)


class PlantMaster(Object):
    __maps_to__ = "kln_plantmaster"
    __classname__ = "kln_plantmaster"


class NatureAsset(Object):
    __maps_to__ = "car_nature_asset"
    __classname__ = "car_nature_asset"


class RequirementType(Object):
    __maps_to__ = "car_requirement_type"
    __classname__ = "car_requirement_type"

class ItemType(Object):
    __maps_to__ = "car_item_type"
    __classname__ = "car_item_type"


class ItemSourceType(Object):
    __maps_to__ = "car_item_source"
    __classname__ = "car_item_source"


class EsgImpact(Object):
    __maps_to__ = "car_esg_impacts"
    __classname__ = "car_esg_impacts"

