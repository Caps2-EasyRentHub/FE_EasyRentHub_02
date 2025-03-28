import {Config} from '@/config';
import {makeAutoObservable} from 'mobx';

export default class FavoriteStore {
  constructor() {
    makeAutoObservable(this);
  }
  onChangeFavorite(itemId: string, userToken: string, status: boolean) {
    if (status === false) {
      fetch(`${Config.API_URL}/api/estate/${itemId}/like`, {
        method: 'PATCH',
        headers: {Authorization: userToken},
      });
    } else {
      fetch(`${Config.API_URL}/api/estate/${itemId}/unlike`, {
        method: 'PATCH',
        headers: {Authorization: userToken},
      });
    }
  }
}
