interface YTApp {
  onYtNavigate_: (e: YTAppEndpoint) => void;
}

interface YTAppEndpoint {
  detail: {
    endpoint: {
      watchEndpoint: {
        videoId: any;
      }
    },
    params: {
      '#': string;
    }
  }
}