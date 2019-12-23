/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from '../components/MapViewDirections.js';
import { GOOGLE_MAPS_API_KEY } from '../constants';
const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 22.309425;
const LONGITUDE = 72.13623;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const ORIGIN = { latitude: 23.0225, longitude: 72.5714 };
const DESTINATION = { latitude: 22.3072, longitude: 73.1812 };

const COLORS = [
  '#7F0000',
  '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
  '#B24112',
  '#E5845C',
  '#238C23',
  '#7F0000',
];
class GoogleMap extends Component {
  static navigationOptions = {
    title: 'Google Map',
  };

  state = {
    region: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <MapView
            provider={this.props.provider}
            style={styles.container}
            initialRegion={this.state.region}>
            <Marker coordinate={ORIGIN} />
            <Marker coordinate={DESTINATION} />

            <MapViewDirections
              origin={ORIGIN}
              destination={DESTINATION}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={3}
              strokeColor="hotpink"
            />
          </MapView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
});

export default GoogleMap;
