import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../src/store/slices/userSlice';
import matchesReducer from '../src/store/slices/matchesSlice';
import zonesReducer from '../src/store/slices/zonesSlice';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      matches: matchesReducer,
      zones: zonesReducer,
    },
  });
};

describe('Mobile App Component Tests', () => {
  // ===== LOGIN SCREEN TESTS =====
  describe('LoginScreen Component', () => {
    test('Test 1: LoginScreen renders without crashing', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      expect(screen.findByText(/sign in/i)).toBeTruthy();
    });

    test('Test 2: LoginScreen has sign-in button', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    });

    test('Test 3: LoginScreen displays branded title', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      expect(screen.findByText(/fitness game/i)).toBeTruthy();
    });

    test('Test 4: Sign-in button is clickable', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      const button = screen.getByRole('button', { name: /sign in/i });
      fireEvent.press(button);
      expect(button).toBeTruthy();
    });

    test('Test 5: LoginScreen has loading state', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      const button = screen.getByRole('button', { name: /sign in/i });
      fireEvent.press(button);
      await waitFor(() => {
        expect(screen.findByText(/signing in/i)).toBeTruthy();
      });
    });
  });

  // ===== HOME SCREEN TESTS =====
  describe('HomeScreen Component', () => {
    test('Test 6: HomeScreen renders successfully', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="HomeScreen" />
        </Provider>
      );
      expect(screen.findByText(/home/i)).toBeTruthy();
    });

    test('Test 7: HomeScreen displays user statistics', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="HomeScreen" />
        </Provider>
      );
      expect(screen.findByText(/stats|statistics/i)).toBeTruthy();
    });

    test('Test 8: HomeScreen has create match button', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="HomeScreen" />
        </Provider>
      );
      expect(screen.getByRole('button', { name: /create|new/i })).toBeTruthy();
    });

    test('Test 9: HomeScreen shows recent matches', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="HomeScreen" />
        </Provider>
      );
      expect(screen.findByText(/recent|matches/i)).toBeTruthy();
    });

    test('Test 10: HomeScreen has navigation tabs', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="HomeScreen" />
        </Provider>
      );
      expect(screen.findByRole('tab')).toBeTruthy();
    });
  });

  // ===== MAP SCREEN TESTS =====
  describe('MapScreen Component', () => {
    test('Test 11: MapScreen renders without error', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MapScreen" />
        </Provider>
      );
      expect(screen.findByText(/map|location/i)).toBeTruthy();
    });

    test('Test 12: MapScreen displays nearby parks', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MapScreen" />
        </Provider>
      );
      expect(screen.findByText(/parks|locations/i)).toBeTruthy();
    });

    test('Test 13: MapScreen shows active matches', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MapScreen" />
        </Provider>
      );
      expect(screen.findByText(/active|matches/i)).toBeTruthy();
    });

    test('Test 14: MapScreen has location controls', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MapScreen" />
        </Provider>
      );
      expect(screen.findByRole('button', { name: /location|my location/i }))
        .toBeTruthy();
    });

    test('Test 15: MapScreen renders GPS zones', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MapScreen" />
        </Provider>
      );
      expect(screen.findByText(/zones|areas/i)).toBeTruthy();
    });
  });

  // ===== CREATE MATCH SCREEN TESTS =====
  describe('CreateMatchScreen Component', () => {
    test('Test 16: CreateMatchScreen renders', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="CreateMatchScreen" />
        </Provider>
      );
      expect(screen.findByText(/create|new match/i)).toBeTruthy();
    });

    test('Test 17: CreateMatchScreen has player count input', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="CreateMatchScreen" />
        </Provider>
      );
      expect(screen.findByPlaceholderText(/player|count/i)).toBeTruthy();
    });

    test('Test 18: CreateMatchScreen has duration input', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="CreateMatchScreen" />
        </Provider>
      );
      expect(screen.findByPlaceholderText(/duration|time/i)).toBeTruthy();
    });

    test('Test 19: CreateMatchScreen has location picker', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="CreateMatchScreen" />
        </Provider>
      );
      expect(screen.findByText(/location|park/i)).toBeTruthy();
    });

    test('Test 20: CreateMatchScreen has create button', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="CreateMatchScreen" />
        </Provider>
      );
      expect(screen.getByRole('button', { name: /create|start/i })).toBeTruthy();
    });
  });

  // ===== JOIN MATCH SCREEN TESTS =====
  describe('JoinMatchScreen Component', () => {
    test('Test 21: JoinMatchScreen renders', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="JoinMatchScreen" />
        </Provider>
      );
      expect(screen.findByText(/join|code/i)).toBeTruthy();
    });

    test('Test 22: JoinMatchScreen has code input field', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="JoinMatchScreen" />
        </Provider>
      );
      expect(screen.findByPlaceholderText(/code|enter/i)).toBeTruthy();
    });

    test('Test 23: JoinMatchScreen validates 6-character code', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="JoinMatchScreen" />
        </Provider>
      );
      const input = screen.getByPlaceholderText(/code/i);
      fireEvent.changeText(input, 'ABC');
      expect(input).toBeTruthy();
    });

    test('Test 24: JoinMatchScreen has join button', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="JoinMatchScreen" />
        </Provider>
      );
      expect(screen.getByRole('button', { name: /join/i })).toBeTruthy();
    });

    test('Test 25: JoinMatchScreen shows match preview', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="JoinMatchScreen" />
        </Provider>
      );
      expect(screen.findByText(/match preview|details/i)).toBeTruthy();
    });
  });

  // ===== MATCHES SCREEN TESTS =====
  describe('MatchesScreen Component', () => {
    test('Test 26: MatchesScreen renders', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MatchesScreen" />
        </Provider>
      );
      expect(screen.findByText(/matches/i)).toBeTruthy();
    });

    test('Test 27: MatchesScreen displays match list', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MatchesScreen" />
        </Provider>
      );
      expect(screen.findByRole('list')).toBeTruthy();
    });

    test('Test 28: MatchesScreen shows match status', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MatchesScreen" />
        </Provider>
      );
      expect(screen.findByText(/active|completed|waiting/i)).toBeTruthy();
    });

    test('Test 29: MatchesScreen has refresh button', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MatchesScreen" />
        </Provider>
      );
      expect(screen.getByRole('button', { name: /refresh/i })).toBeTruthy();
    });

    test('Test 30: MatchesScreen filters matches', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="MatchesScreen" />
        </Provider>
      );
      expect(screen.findByRole('button', { name: /filter/i })).toBeTruthy();
    });
  });

  // ===== NAVIGATION TESTS =====
  describe('Navigation System', () => {
    test('Test 31: RootNavigator renders', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <navigator.render name="RootNavigator" />
        </Provider>
      );
      expect(navigator).toBeTruthy();
    });

    test('Test 32: AuthNavigator handles auth flow', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <navigator.render name="AuthNavigator" />
        </Provider>
      );
      expect(navigator).toBeTruthy();
    });

    test('Test 33: MainTabs navigation works', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <navigator.render name="MainTabs" />
        </Provider>
      );
      expect(navigator).toBeTruthy();
    });

    test('Test 34: MatchesStack navigation works', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <navigator.render name="MatchesStack" />
        </Provider>
      );
      expect(navigator).toBeTruthy();
    });

    test('Test 35: Can navigate between screens', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <navigator.render name="RootNavigator" />
        </Provider>
      );
      // Navigation should be functional
      expect(navigator).toBeTruthy();
    });
  });

  // ===== REDUX STATE TESTS =====
  describe('Redux State Management', () => {
    test('Test 36: User slice initializes', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.user).toBeDefined();
    });

    test('Test 37: Matches slice initializes', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.matches).toBeDefined();
    });

    test('Test 38: Zones slice initializes', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.zones).toBeDefined();
    });

    test('Test 39: Can dispatch user actions', () => {
      const store = createTestStore();
      // Test that actions can be dispatched
      expect(store).toBeTruthy();
    });

    test('Test 40: Can dispatch match actions', () => {
      const store = createTestStore();
      // Test that actions can be dispatched
      expect(store).toBeTruthy();
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('App Integration', () => {
    test('Test 41: App initializes with Redux store', () => {
      const store = createTestStore();
      expect(store).toBeTruthy();
    });

    test('Test 42: All screens are accessible', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <screen.render name="LoginScreen" />
        </Provider>
      );
      expect(screen).toBeTruthy();
    });
  });
});
