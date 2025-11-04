import {Registry} from 'cs-web-components-base';
import {prefixNS} from './helpers';
import reducer from './reducers/reducers';
import MainComponent from './containers/MainComponent';
import CarComponent from './containers/CarComponent';

Registry.registerComponent(prefixNS('MainComponent'), MainComponent);
Registry.registerComponent(prefixNS('CarComponent'), CarComponent);
Registry.registerReducer(prefixNS('reducer'), reducer);

export default {
    MainComponent,
    CarComponent
};
