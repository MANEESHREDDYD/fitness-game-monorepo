import 'react-native-gesture-handler/jestSetup';

// Mock Expo globals to avoid "import outside scope" errors in generic jest-expo setup
global.__ExpoImportMetaRegistry = {};

// Mock Expo Location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: {
            latitude: 40.7829,
            longitude: -73.9654,
        },
    }),
    watchPositionAsync: jest.fn().mockImplementation((options, callback) => {
        // Simulate initial location
        callback({ coords: { latitude: 40.7829, longitude: -73.9654, speed: 0 } });
        return Promise.resolve({
            remove: jest.fn(),
        });
    }),
    Accuracy: {
        BestForNavigation: 6,
        Balanced: 3,
    },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');

    const MockMapView = (props) => {
        return <View testID="map-view">{props.children}</View>;
    };

    const MockMarker = (props) => {
        return <View testID="map-marker">{props.children}</View>;
    };

    const MockCircle = (props) => {
        return <View testID="map-circle">{props.children}</View>;
    };

    return {
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker,
        Circle: MockCircle,
        PROVIDER_GOOGLE: 'google',
    };
});

// Mock Socket.io
jest.mock('socket.io-client', () => {
    const emit = jest.fn();
    const on = jest.fn();
    const off = jest.fn();
    const disconnect = jest.fn();
    return jest.fn(() => ({
        emit,
        on,
        off,
        disconnect,
        connected: true,
    }));
});

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true, zones: [] }),
    })
);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});
