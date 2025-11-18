/**
 * Created by cla on 07.04.2016.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../reducers/store/store';
import CapexMastersSetup from '../components/car/master/CapexMastersSetup';

// import CapexMastersSetup from '../components/car/master/CapexMastersSetup';

export default class MainComponent extends React.Component {
  render() {
    return (
      <Provider store={store}>
        < CapexMastersSetup/>
      </Provider>
    );
  }
}
