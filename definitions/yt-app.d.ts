interface YTApp {
  onYtNavigate: (e: YTAppEndpoint) => void;
}

interface YTAppEndpoint {
  detail: {
    endpoint: {
      commandMetadata: {
        webCommandMetadata: {
          url: string;
        };
      };
      watchEndpoint: {
        videoId: any;
      };
    };
  };
}
