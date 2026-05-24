import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the _app_backup in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
