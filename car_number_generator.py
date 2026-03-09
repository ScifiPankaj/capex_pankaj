from cs.platform.web import JsonAPI
from cs.platform.web.root import Internal
from cdb import sqlapi


class CarNumberGeneratorAPI(JsonAPI):
    pass


@Internal.mount(app=CarNumberGeneratorAPI, path="car_number")
def _mount_app():
    return CarNumberGeneratorAPI()


class CarNumberService:

    def __init__(self):
        self.CAR_TABLE = "car_request"

    def get_next_car_number(self):
        """
        Generate next unique CAR number with gap filling (C1, C2, C3, etc.)
        Returns: {"success": True, "car_no": "C3"}
        """
        try:
            rs = sqlapi.RecordSet2(
                sql=f"SELECT DISTINCT car_no FROM {self.CAR_TABLE} WHERE car_no IS NOT NULL ORDER BY car_no"
            )

            existing_ids = set()
            for row in rs:
                car_no = row.get('car_no', '')
                if car_no and str(car_no).startswith('C'):
                    try:
                        num = int(str(car_no)[1:])
                        existing_ids.add(num)
                    except ValueError:
                        continue

            # If no IDs exist, start with C1
            if not existing_ids:
                return {
                    "success": True,
                    "car_no": "C1"
                }

            # Find the next available number (gap filling)
            next_num = 1
            while next_num in existing_ids:
                next_num += 1

            new_car_no = f"C{next_num}"

            print(f"✅ Generated new CAR number: {new_car_no}")

            return {
                "success": True,
                "car_no": new_car_no
            }

        except Exception as e:
            print(f"❌ Error generating CAR number: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate CAR number: {str(e)}"
            }


@CarNumberGeneratorAPI.path(model=CarNumberService, path="")
def _path():
    return CarNumberService()


@CarNumberGeneratorAPI.json(model=CarNumberService, request_method="GET")
def _get_next_car_number(model, request):
    """
    GET /internal/car_number_generator
    Returns next available CAR number
    Response: {"success": true, "car_no": "C3"}
    """
    return model.get_next_car_number()