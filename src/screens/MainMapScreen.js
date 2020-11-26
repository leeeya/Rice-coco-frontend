import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { StackActions } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import axiosInstance from '../config/axiosConfig';
import isLocationNear from '../utils/isLocationNear';
import ReloadImage from '../components/ReloadImage';
import RemainingTime from '../components/RemainingTime';
import {
  setUserLocation,
  setWaitingMeetings,
  setSelectedMeeting,
} from '../actions';
import SCREEN from '../constants/screen';
import ROUTE from '../constants/route';
import ALERT from '../constants/alert';
import {
  MapWrapper,
  OverlayHeader,
  OverlayText,
  OverlayFooter,
  StyledImage,
  RestaurantSearchButton,
  styles,
} from '../shared/index';

const MainMapScreen = ({
  userId,
  userLocation,
  waitingMeetings,
  setWaitingMeetings,
  setUserLocation,
  setSelectedMeeting,
  navigation,
}) => {
  const [fontLoaded] = useFonts({
    Glacial: require('../../assets/fonts/GlacialIndifference-Bold.otf'),
  });
  const isMeetingExisted = !!waitingMeetings.length;
  const handleRestaurantClick = restaurantInfo => {
    const partnerNickname = restaurantInfo.partnerNickname;

    setSelectedMeeting(restaurantInfo);
    navigation.navigate(SCREEN.RESTAURANT_DETAILS, { partnerNickname });
  };

  const handleReloadClick = async () => {
    const { data } = await axiosInstance.get(ROUTE.MEETINGS);
    const { filteredMeetings } = data;

    setWaitingMeetings(filteredMeetings);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== ALERT.STATUS_GRANTED) {
        return alert(ALERT.ERROR_LOCATION_WAS_DENIED);
      }

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { activeMeeting },
        } = await axiosInstance.get(`${ROUTE.MEETINGS}${ROUTE.USERS}/${userId}`);

        if (activeMeeting) {
          const { _id: meetingId } = activeMeeting;
          setSelectedMeeting({ meetingId });

          activeMeeting.isMatched
            ? navigation.dispatch(StackActions.replace(SCREEN.MATCH_SUCCESS))
            : navigation.dispatch(StackActions.replace(SCREEN.MATCH_WAITING));

          return;
        }

        const { data } = await axiosInstance.get(ROUTE.MEETINGS);
        const { filteredMeetings } = data;

        setWaitingMeetings(filteredMeetings);
      } catch (error) {
        alert(error.message);
      }
    })();
  }, []);

  return fontLoaded ? (
    <MapWrapper>
      <MapView
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider={PROVIDER_GOOGLE}
        style={styles.mapStyle}
        enableZoomControl={true}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        {
          isMeetingExisted &&
          waitingMeetings.map(meeting => {
            const {
              meetingId,
              restaurant: { restaurantId, name: restaurantName, location },
              partnerNickname,
              expiredTime,
            } = meeting;

            const isMarkerInRange = isLocationNear(
              location,
              userLocation,
              5000,
            );

            return (
              <Marker
                key={meetingId}
                title={restaurantName}
                description={`${partnerNickname} 대기중`}
                coordinate={location}
                onCalloutPress={() => {
                  if (!isMarkerInRange) return;

                  const restaurantInfo = {
                    meetingId,
                    restaurantId,
                    restaurantName,
                    partnerNickname,
                  };

                  handleRestaurantClick(restaurantInfo);
                }}
              >
                {
                  isMarkerInRange &&
                  <RemainingTime
                    expiredTime={expiredTime}
                    size='12px'
                  />
                }
                <StyledImage
                  source={require('../../assets/images/rice.png')}
                  width='24px'
                  height='26px'
                  resizeMode='cover'
                />
              </Marker>
            );
          })}
        <Circle
          center={userLocation}
          radius={5000}
          strokeColor='rgba(0, 0, 255, 0.1)'
          fillColor='rgba(0, 0, 255, 0.1)'
        />
      </MapView>
      <LinearGradient
        colors={['rgba(255, 255, 255, 1)', 'transparent']}
        style={styles.linearGradient}
      />
      <OverlayHeader>
        <OverlayText font='Glacial' size='30px'>R I C E C O C O
        </OverlayText>
        <OverlayText>코코들이 당신을 기다리고 있어요!
        </OverlayText>
      </OverlayHeader>
      <OverlayFooter>
        <RestaurantSearchButton>
          <ReloadImage
            onClick={handleReloadClick}
          />
        </RestaurantSearchButton>
      </OverlayFooter>
    </MapWrapper>
  ) : null;
};

export default connect(state => ({
  userId: state.user._id,
  userLocation: state.location,
  waitingMeetings: state.meetings.waitingMeetings,
}), {
  setUserLocation,
  setWaitingMeetings,
  setSelectedMeeting,
})(MainMapScreen);
