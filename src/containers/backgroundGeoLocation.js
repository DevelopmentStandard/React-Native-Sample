import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const BACKGROUND_GEOLOCATION_CONFIG = {
  desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
  stationaryRadius: 50,
  distanceFilter: 50,
  notificationTitle: 'Background tracking',
  notificationText: 'enabled',
  debug: true,
  startOnBoot: false,
  stopOnTerminate: true,
  locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
  interval: 10000,
  fastestInterval: 5000,
  activitiesInterval: 10000,
  stopOnStillActivity: false,
  maxLocations: 1,
  url: 'http://192.168.81.15:3000/location',
  httpHeaders: {
    'X-FOO': 'bar'
  },
  // customize post properties
  postTemplate: {
    lat: '@latitude',
    lon: '@longitude',
    foo: 'bar' // you can also add your own properties
  }
}

class BackgroundGeoLocation extends Component {

  static navigationOptions = {
    title: 'Background Geo Location',
  };

  constructor(props) {
    super(props);
    this.state = {
      region: null,
      locations: [],
      stationaries: [],
      isRunning: false
    };
  }

  componentDidMount() {
    // Step 1: configuration
    BackgroundGeolocation.configure(BACKGROUND_GEOLOCATION_CONFIG, this.addBackgroundGeolocationEvents.bind(this), () => {
      Alert.alert("Error in configuration")
    });
  }

  componentWillUnmount() {
    BackgroundGeolocation.events.forEach(event =>
      BackgroundGeolocation.removeAllListeners(event)
    );
  }

  addBackgroundGeolocationEvents = () => {
    // Step 2:  Listen to events:
    BackgroundGeolocation.getCurrentLocation(this.getCurrentLocation.bind(this), this.onLocationError.bind(this));
    BackgroundGeolocation.on('start', this.onGeolocationStart.bind(this));
    BackgroundGeolocation.on('stop', this.onGeolocationStop.bind(this));
    BackgroundGeolocation.on('authorization', this.authorization.bind(this));
    BackgroundGeolocation.on('error', this.onError.bind(this));
    BackgroundGeolocation.on('location', this.onLocation.bind(this));
    BackgroundGeolocation.on('stationary', this.stationary.bind(this));
    BackgroundGeolocation.on('foreground', this.foreground.bind(this));
    BackgroundGeolocation.on('background', this.background.bind(this));
    BackgroundGeolocation.on('abort_requested', this.abort_requested.bind(this));
    BackgroundGeolocation.checkStatus(this.checkStatus.bind(this));
  }

  /**
    * @event getCurrentLocation
  */
  getCurrentLocation(lastLocation) {
    console.log('[lastLocation] - ', lastLocation);
    let region = this.state.region;
    const latitudeDelta = 0.01;
    const longitudeDelta = 0.01;
    region = Object.assign({}, lastLocation, {
      latitudeDelta,
      longitudeDelta
    });
    this.setState({ locations: [lastLocation], region });
  }

  /**
   * @event onLocationError
  */
  onLocationError = (error) => {
    Alert.alert('Error obtaining current location', JSON.stringify(error));
  }

  /**
    *@event start
  */
  onGeolocationStart = () => {
    // service started successfully
    // you should adjust your app UI for example change switch element to indicate
    // that service is running
    console.log(`[DEBUG] BackgroundGeolocation has been started`);
    this.setState({ isRunning: true });
  }

  /**
    * @event stop
  */
  onGeolocationStop = () => {
    console.log(`[DEBUG] BackgroundGeolocation has been stopped`);
    this.setState({ isRunning: false });
  }

  /**
    * @event authorization
  */
  authorization = (status) => {
    console.log(`[INFO] BackgroundGeolocation authorization status: ${status}`);
    if (status !== BackgroundGeolocation.AUTHORIZED) {

      Alert.alert(
        'App requires location tracking',
        'Would you like to open app settings?',
        [
          {
            text: 'Yes',
            onPress: () => BackgroundGeolocation.showAppSettings()
          },
          {
            text: 'No',
            onPress: () => console.log('No Pressed'),
            style: 'cancel'
          }
        ])
    }
  }

  /**
   * @event onError
  */
  onError = ({ message }) => {
    Alert.alert(`BackgroundGeolocation error, ${message}`);
  }

  /**
   * @onLocation
  */
  onLocation = (location) => {
    console.log(`[DEBUG] BackgroundGeolocation location,`, location);
    BackgroundGeolocation.startTask(taskKey => {
      requestAnimationFrame(() => {
        const longitudeDelta = 0.01;
        const latitudeDelta = 0.01;
        const region = Object.assign({}, location, {
          latitudeDelta,
          longitudeDelta
        });
        const locations = this.state.locations.slice(0);
        locations.push(location);
        this.setState({ locations, region });
        BackgroundGeolocation.endTask(taskKey);
      });
    });
  }

  /**
   * @event stationary
  */
  stationary = (location) => {
    console.log(`[DEBUG] BackgroundGeolocation stationary,`, location);
    BackgroundGeolocation.startTask(taskKey => {
      requestAnimationFrame(() => {
        if (location.radius) {
          const longitudeDelta = 0.01;
          const latitudeDelta = 0.01;
          const stationaries = this.state.stationaries.slice(0);
          const region = Object.assign({}, location, {
            latitudeDelta,
            longitudeDelta
          });
          stationaries.push(location);
          this.setState({ stationaries, region });
        }
        BackgroundGeolocation.endTask(taskKey);
      });
    });
  }

  /** 
   * @event foreground
  */
  foreground = () => {
    console.log('[INFO] App is in foreground');
  }

  /** 
    * @event foreground
   */
  background = () => {
    console.log('[INFO] App is in background');
  }

  /**
    * @event checkStatus
  */
  checkStatus = ({ isRunning, locationServicesEnabled, authorization }) => {
    console.log(`[INFO] BackgroundGeolocation service is running, ${isRunning}`);
    console.log(`[INFO] BackgroundGeolocation services enabled, ${locationServicesEnabled}`);
    console.log(`[INFO] BackgroundGeolocation auth status: , ${authorization}`);
    this.setState({ isRunning });
    if (isRunning) {
      BackgroundGeolocation.start();
    }
  }

  /** *
   * @event abort_requested
  */
  abort_requested = () => {
    console.log('[INFO] Server responded with 285 Updates Not Required');
    // Here we can decide whether we want stop the updates or not.
    // If you've configured the server to return 285, then it means the server does not require further update.
    // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
    // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
  }

  /** *
    * @event abort_requested
  */
  http_authorization = () => {
    console.log('[INFO] App needs to authorize the http requests');
  }

  startTracking = () => {
    BackgroundGeolocation.checkStatus(({ locationServicesEnabled, authorization }) => {
      if (!locationServicesEnabled) {
        Alert.alert(
          'Location services disabled',
          'Would you like to open location settings?',
          [
            {
              text: 'Yes',
              onPress: () => BackgroundGeolocation.showLocationSettings()
            },
            {
              text: 'No',
              onPress: () => console.log('No Pressed'),
              style: 'cancel'
            }
          ]
        );
      }
      else if (authorization == 99) {
        // authorization yet to be determined
        BackgroundGeolocation.start();
      } else if (authorization == BackgroundGeolocation.AUTHORIZED) {
        // calling start will also ask user for permission if needed
        // permission error will be handled in permisision_denied event
        BackgroundGeolocation.start();
      } else {
        Alert.alert(
          'App requires location tracking',
          'Please grant permission',
          [
            {
              text: 'Ok',
              onPress: () => BackgroundGeolocation.start()
            }
          ]
        );
      }
    });
  }

  stopTracking = () => {
    BackgroundGeolocation.stop();
  }


  render() {
    const { locations, stationaries, region, isRunning } = this.state;
    /* console.log("locations render", locations);
    console.log("stationaries render", stationaries);
    console.log("isRunning render", isRunning); */


    const markers = locations.map((location, idx) => <Marker key={`Marker-${idx}`} coordinate={location} />)
    const circles = stationaries.map((stationary, idx) => <MapView.Circle key={`Circle-${idx}`} center={stationary} radius={stationary.radius} fillColor="#AAA" />)

    return (
      <View style={styles.container}>
        <MapView style={{ flex: 1 }} region={region}>
          {markers}
          {circles}
        </MapView>
        <TouchableOpacity style={styles.startStopController} onPress={() => { isRunning ? this.stopTracking() : this.startTracking() }}>
          <Text style={styles.startStopControllerText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
  startStopController: {
    height: 45,
    width: `100%`,
    backgroundColor: `hotpink`,
    alignItems: 'center',
    justifyContent: `center`,
    position: `absolute`,
    bottom: 0,
  },
  startStopControllerText: {
    color: '#FFF'
  }
});

export default BackgroundGeoLocation;
