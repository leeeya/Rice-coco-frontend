import * as types from '../constants/actionTypes';

const initialState = {
  filteredMeetings: [],
  selectedMeeting: {
    meetingId: '',
    restaurantId: '',
    restaurantName: '',
    restaurantLocation: {
      latitude: 0,
      longitude: 0
    },
    partnerNickname: '',
  },
};

export const meetings = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_MEETINGS:
      return {
        ...state,
        filteredMeetings: [ ...action.payload ],
      };
    case types.SET_SELECTED_MEETING:
      return {
        ...state,
        selectedMeeting: {
          ...state.selectedMeeting,
          ...action.payload
        },
      };
    default:
      return state;
  }
};
