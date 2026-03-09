# from .car_number_generator import generate_car_number
# from cs.platform.web import JsonAPI
# from cs.platform.web.root import Internal
#
#
# class CarNumberApp(JsonAPI):
#     """JSON endpoint that returns backend generated CAR numbers."""
#     pass
#
#
# @Internal.mount(app=CarNumberApp, path="car_number")
# def _mount_car_number_app():
#     return CarNumberApp()
#
#
# class CarNumberResource(object):
#     """Expose a simple API to create CAR numbers on demand."""
#
#     def create_car_number(self, data=None):
#         return {"car_no": generate_car_number()}
#
#     def get_example(self):
#         return {"car_no": generate_car_number()}
#
#
# @CarNumberApp.path(model=CarNumberResource, path="")
# def _car_number_resource():
#     return CarNumberResource()
#
#
# # ✅ POST view – correct keyword: request_method
# @CarNumberApp.json(model=CarNumberResource, request_method="POST")
# def _car_number_post(model, request):
#     return model.create_car_number(request.json)
#
#
# # ✅ GET view – ya to request_method="GET" rakho, ya default chhod do
# @CarNumberApp.json(model=CarNumberResource, request_method="GET")
# def _car_number_get(model, request):
#     return model.get_example()
