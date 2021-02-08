interface YTApp {
  onYtNavigate_: (e: Endpoint) => void;
}

interface Endpoint {
  detail: {
    endpoint: {
      watchEndpoint: {
        videoId: any;
      }
    },
    params: {
      syncId: string;
    }
  }
}