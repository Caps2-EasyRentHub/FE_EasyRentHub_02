import {StackActions} from '@react-navigation/native';
import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
let navigated = false;
export const push = async ({name, params}: {name: any; params: any}) => {
  if (navigationRef.isReady()) {
    if (!navigated) {
      navigated = true;
      navigationRef.dispatch(StackActions.push(name, params));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    navigated = false;
  }
};

export const navigate = ({name}: {name: string}) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never);
  }
};

export const goBack = async () => {
  if (!navigated) {
    navigated = true;
    navigationRef.goBack();
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));

  navigated = false;
};

export const replace = ({name, params}: {name: any; params?: any}) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
};
