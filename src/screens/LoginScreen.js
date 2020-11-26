import React, { useEffect } from 'react';
import { ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import { StackActions } from '@react-navigation/native';
import asyncStorage from '@react-native-async-storage/async-storage';
import configuredAxios from '../config/axiosConfig';
import { setUserInfo } from '../actions';
import { LoginButton, P, Wrapper } from '../shared/index';
import { logInWithFacebook } from '../utils/authByFacebook';

import SCREEN from '../constants/screen';
import ALERT from '../constants/alert';
import { COLOR } from '../constants/color';
import ROUTE from '../constants/route';

const Login = ({ navigation, setUserInfo }) => {
  useEffect(() => {
    (async () => {
      const token = await asyncStorage.getItem('token');
      if (!token) return;

      const {data: { user } } = await configuredAxios.post(`${ROUTE.USERS}${ROUTE.LOGIN}`);

      setUserInfo(user);

      user.preferredPartner
        ? navigation.dispatch(StackActions.replace(SCREEN.MAIN_MAP))
        : navigation.dispatch(StackActions.replace(SCREEN.PREFERRED_PARTNER));
    })();
  }, []);

  const handleLoginButtonClick = async event => {
    event.target.disabled = true;

    try {
<<<<<<< HEAD
      const { email } = await logInWithFacebook();
      const { data } = await configuredAxios.post('/users/login', { email });
=======
      const email = await googleAuth();
      if (!email) return;

      const { data } = await configuredAxios.post(`${ROUTE.USERS}${ROUTE.LOGIN}`, { email });
>>>>>>> 7f19983329e7787326d7b77a8676c3d02e308fd9

      if (data.result === ALERT.NOT_EXIST) {
        navigation.dispatch(StackActions.replace(SCREEN.USER_REGISTER, { email }));

        return;
      }

      const { user, token } = data;
      await asyncStorage.setItem('token', token);
      setUserInfo(user);

      user.preferredPartner
        ? navigation.dispatch(StackActions.replace(SCREEN.MAIN_MAP))
        : navigation.dispatch(StackActions.replace(SCREEN.PREFERRED_PARTNER));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Wrapper color={COLOR.THEME_COLOR}>
      <ImageBackground
        source={require('../../assets/images/ricecoco_splash.png')}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 80,
        }}
      />
      <LoginButton onPress={handleLoginButtonClick}>
        <P>페이스북 로그인</P>
      </LoginButton>
    </Wrapper>
  );
};

export default connect(null, { setUserInfo })(Login);
