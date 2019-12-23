import React, { PureComponent } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import { Bulb } from "../nativeModules"
class Dashboard extends PureComponent {
  
  static navigationOptions = {
    title: 'Dashboard',
  };


  constructor(props) {
    super(props);
    this._onStatusChange = this._onStatusChange.bind(this);
    this.state = {
      isOn: false,
      ListItems: [
        {
          screen: `BackgroundGeoLocation`,
          label: `Background Geo Location`,
        },
        {
          screen: `GoogleMap`,
          label: `Google Map`,
        },
      ],
    };

  }

  _onStatusChange = e => {
    this.setState({ isOn: e.nativeEvent.isOn });
    if (e.nativeEvent.isOn) {
      this.props.navigation.navigate(this.state.ListItems[0].screen)
    } else {
      this.props.navigation.navigate(this.state.ListItems[1].screen)
    }
  }

  render() {
    const { ListItems, isOn } = this.state;
    const ListItemView = ListItems.map(item => (
      <TouchableOpacity
        style={styles.ListItemView}
        key={item.screen}
        onPress={() => this.props.navigation.navigate(item.screen)}>
        <Text>{item.label}</Text>
      </TouchableOpacity>
    ));

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            {ListItemView}
            <View style={styles.NativeButtonContainer}>
              <Text>This state of Bulb come from Native Code to JavaScript</Text>
              <Text>{isOn ? "Bulb is On" : "Bulb is Off"}</Text>
              <Bulb style={{ height: 40, marginTop: 7 }} isOn={isOn} onStatusChange={this._onStatusChange} />
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  ListItemView: {
    height: 50,
    justifyContent: 'center',
    marginHorizontal: 7,
    borderBottomColor: 'hotpink',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  NativeButtonContainer: {

    marginHorizontal: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "hotpink",
    paddingVertical: 7,
    borderTopEndRadius: 8
  }
});

export default Dashboard;
