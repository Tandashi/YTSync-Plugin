interface YTApp {
  onYtNavigate_: (e: YTAppEndpoint) => void;
  data: YTAppData;
}

interface YTAppData {
  playerResponse: YTAppPlayerResponse;
}

interface YTAppPlayerResponse {
  videoDetails: YTAppVideoDetails;
}

interface YTAppVideoDetails {
  author: string;
  title: string;
  videoId: string;
}

interface YTAppEndpoint {
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