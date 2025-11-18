import {Registry} from 'cs-web-components-base';
import {prefixNS} from './helpers';
import reducer from './reducers/reducers';

// Import layouts


import MainComponent from './containers/MainComponent';
import CarComponent from './containers/CarComponent';
import Layout from './containers/Layout';

import './output.css';


// Register layouts;


Registry.registerComponent(prefixNS('MainComponent'), MainComponent);
Registry.registerComponent(prefixNS('CarComponent'), CarComponent);
Registry.registerComponent(prefixNS('Layout'), Layout);

Registry.registerReducer(prefixNS('reducer'), reducer);

export default {
  
    MainComponent,
    CarComponent,
    Layout
};