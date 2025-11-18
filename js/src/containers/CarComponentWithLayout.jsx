// src/containers/CarComponentWithLayout.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../reducers/store/store';
import MainLayout from '../layouts/MainLayout';
import CarComponent from './CarComponent';

/**
 * 🎨 CAR Component wrapped with MainLayout
 * This replaces the standalone CarComponent
 */
const CarComponentWithLayout = () => {
  return (
    <Provider store={store}>
      <MainLayout>
        <CarComponent />
      </MainLayout>
    </Provider>
  );
};

export default CarComponentWithLayout;