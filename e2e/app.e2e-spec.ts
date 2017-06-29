import { NgSpotifyDeployPage } from './app.po';

describe('ng-spotify-deploy App', () => {
  let page: NgSpotifyDeployPage;

  beforeEach(() => {
    page = new NgSpotifyDeployPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
