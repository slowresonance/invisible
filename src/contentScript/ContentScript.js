import { useEffect, useState } from "react";

const getFlag = () => {
  if (document.location.href === "https://www.youtube.com/") return 0;
  if (document.location.href.includes("https://www.youtube.com/watch?"))
    return 1;
};

function ContentScript() {
  const [data, setData] = useState([
    ["at", "valorant"],
    ["dean", "blue", "valorant"],
  ]);
  const [flag, setFlag] = useState(getFlag());

  let wordReg = new RegExp("a^");
  let channelReg = new RegExp("a^");

  // YouTube doesn't reload its pages, it replaces the history state
  // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes

  let previousUrl = document.location.href;

  window.onload = function () {
    let bodyList = document.querySelector("body");

    let observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (previousUrl !== document.location.href) {
          previousUrl = document.location.href;
          setFlag(getFlag());
        }
      });
    });

    observer.observe(bodyList, {
      childList: true,
      subtree: true,
    });
  };

  useEffect(() => {
    if (data[0] !== []) {
      wordReg = new RegExp(data[0].join("|"), "i");
    } else {
      wordReg = new RegExp("a^");
    }
    if (data[1] !== []) {
      channelReg = new RegExp(data[1].join("|"), "i");
    } else {
      channelReg = new RegExp("a^");
    }
  }, [data]);

  const filterByTitleWatch = (video) => {
    if (!video.querySelector("#video-title")) return false;
    if (wordReg.test(video.querySelector("#video-title").innerText))
      return true;
    return false;
  };

  const filterByChannelWatch = (video) => {
    if (!video.querySelector("#text-container > yt-formatted-string"))
      return false;
    if (
      channelReg.test(
        video.querySelector("#text-container > yt-formatted-string").innerText
      )
    )
      return true;
    return false;
  };

  const applyFiltersWatch = () => {
    console.log("AFW 👀");

    const selector = "#items > ytd-item-section-renderer > #contents";
    let videoCount = 0;

    if (document.querySelector(selector)) {
      const videoList = document.querySelector(selector);

      const observer = new MutationObserver(() => {
        if (
          document
            .querySelector(selector)
            .getElementsByTagName("ytd-compact-video-renderer").length <=
          videoCount
        )
          return;

        const videos = document
          .querySelector(selector)
          .getElementsByTagName("ytd-compact-video-renderer");

        videoCount = videos.length;

        for (let video of videos) {
          if (filterByTitleWatch(video) || filterByChannelWatch(video)) {
            // video.style.background = "red";
            video.style.display = "none";
          }
        }
      });
      observer.observe(videoList, { subtree: true, childList: true });
    } else {
      setTimeout(applyFiltersWatch, 2000);
    }
  };

  const filterByTitleHome = (video) => {
    if (!video.querySelector("#video-title")) return false;
    if (wordReg.test(video.querySelector("#video-title").innerText))
      return true;
    return false;
  };

  const filterByChannelHome = (video) => {
    if (!video.querySelector("#text-container > yt-formatted-string > a"))
      return false;
    if (
      channelReg.test(
        video.querySelector("#text-container > yt-formatted-string > a")
          .innerText
      )
    )
      return true;
    return false;
  };

  const applyFiltersHome = () => {
    console.log("AFH 🏠");
    const selector = "ytd-rich-grid-renderer > #contents";
    let videoCount = 0;

    if (document.querySelector(selector)) {
      const videoList = document.querySelector(selector);

      const observer = new MutationObserver(() => {
        if (
          document
            .querySelector(selector)
            .getElementsByTagName("ytd-rich-item-renderer").length <= videoCount
        )
          return;

        const videos = document
          .querySelector(selector)
          .getElementsByTagName("ytd-rich-item-renderer");

        videoCount = videos.length;

        for (let video of videos) {
          if (filterByTitleHome(video) || filterByChannelHome(video)) {
            // video.style.background = "red";
            video.style.display = "none";
          }
        }
      });
      observer.observe(videoList, { subtree: true, childList: true });
    } else {
      setTimeout(applyFiltersHome, 2000);
    }
  };

  applyFiltersHome();
  applyFiltersWatch();

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.cmd) {
      case "apply-filters":
        applyFilters();
        console.log(msg);
        break;
    }
  });

  return <></>;
}

export default ContentScript;
