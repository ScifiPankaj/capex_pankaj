# -*- mode: python; coding: utf-8 -*-
#
# Copyright (C) 1990 - 2016 CONTACT Software GmbH
# All rights reserved.
# http://www.contact.de/

__docformat__ = "restructuredtext en"
__revision__ = "$Id: main.py 142800 2016-06-17 12:53:51Z js $"

import os

from cdb import rte
from cdb import sig

from cs.platform.web import static
from cs.platform.web.root import Root

from cs.web.components.base.main import BaseApp
from cs.web.components.base.main import BaseModel

# ADMIN DASHBOARD
class CapexApp(BaseApp):
    pass


@Root.mount(app=CapexApp, path="/kalyani.iot/admin")
def _mount_app():
    return CapexApp()


@CapexApp.view(model=BaseModel, name="document_title", internal=True)
def default_document_title(self, request):
    return "Capex"


@CapexApp.view(model=BaseModel, name="app_component", internal=True)
def _setup(self, request):
    request.app.include("kalyani-iot-capex", "0.0.1")
    return "kalyani-iot-capex-MainComponent"


@CapexApp.view(model=BaseModel, name="base_path", internal=True)
def get_base_path(self, request):
    return request.path


# CAR FORM AND USER DASHBOARD


class CarFrom(BaseApp):
    pass


@Root.mount(app=CarFrom, path="/kalyani.iot/UserDashboard")
def _mount_app():
    return CarFrom()


@CarFrom.view(model=BaseModel, name="document_title", internal=True)
def default_document_title(self, request):
    return "Capex"


@CarFrom.view(model=BaseModel, name="app_component", internal=True)
def _setup(self, request):
    request.app.include("kalyani-iot-capex", "0.0.1")
    return "kalyani-iot-capex-CarComponent"


@CarFrom.view(model=BaseModel, name="base_path", internal=True)
def get_base_path(self, request):
    return request.path

############for testing Layouts

class Layout(BaseApp):
    pass


@Root.mount(app=Layout, path="/kalyani.iot/carform")
def _mount_app():
    return Layout()


@Layout.view(model=BaseModel, name="document_title", internal=True)
def default_document_title(self, request):
    return "carform"


@Layout.view(model=BaseModel, name="app_component", internal=True)
def _setup(self, request):
    request.app.include("kalyani-iot-capex", "0.0.1")
    return "kalyani-iot-capex-Layout"


@Layout.view(model=BaseModel, name="base_path", internal=True)
def get_base_path(self, request):
    return request.path



@sig.connect(rte.APPLICATIONS_LOADED_HOOK)
def _register_libraries():
    lib = static.Library("kalyani-iot-capex", "0.0.1",
                         os.path.join(os.path.dirname(__file__), 'js', 'build'))
    lib.add_file("kalyani-iot-capex.js")
    lib.add_file("kalyani-iot-capex.js.map")
    static.Registry().add(lib)