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
  let wordReg = new RegExp("a^");
  let channelReg = new RegExp("a^");
  const [flag, setFlag] = useState(getFlag());
  const [currentUrl, setCurrentUrl] = useState(document.location.href);

  const selectors = [
    {
      videoSection: "ytd-rich-grid-renderer > #contents",
      videoRenderer: "ytd-rich-item-renderer",
      title: "#video-title",
      channel: "#text-container > yt-formatted-string > a",
    },
    {
      videoSection: "#items > ytd-item-section-renderer > #contents",
      videoRenderer: "ytd-compact-video-renderer",
      title: "#video-title",
      channel: "#text-container > yt-formatted-string",
    },
  ];

  // YouTube doesn't reload its pages, it replaces the history state
  // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes

  window.onload = function () {
    let bodyList = document.querySelector("body");

    let observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (currentUrl !== document.location.href) {
          setCurrentUrl(document.location.href);
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
  }, [data, currentUrl]);

  const filterByTitle = (video) => {
    console.log(wordReg, channelReg);
    if (!video.querySelector(selectors[flag]["title"])) return false;
    if (wordReg.test(video.querySelector(selectors[flag]["title"]).innerText)) {
      console.log(video.querySelector(selectors[flag]["title"]).innerText);
      return true;
    }
    return false;
  };

  const filterByChannel = (video) => {
    if (!video.querySelector(selectors[flag]["channel"])) return false;
    if (
      channelReg.test(video.querySelector(selectors[flag]["channel"]).innerText)
    ) {
      return true;
    }
    return false;
  };

  const applyFilters = () => {
    let videoCount = 0;

    if (document.querySelector(selectors[flag]["videoSection"])) {
      const videoList = document.querySelector(selectors[flag]["videoSection"]);

      let observer = new MutationObserver(() => {
        if (
          document
            .querySelector(selectors[flag]["videoSection"])
            .getElementsByTagName(selectors[flag]["videoRenderer"]).length <=
          videoCount
        )
          return;

        const videos = document
          .querySelector(selectors[flag]["videoSection"])
          .getElementsByTagName(selectors[flag]["videoRenderer"]);

        videoCount = videos.length;
        console.log("🤖 inside observer");

        for (let video of videos) {
          if (filterByTitle(video) || filterByChannel(video)) {
            // video.style.background = "red";
            video.style.display = "none";
          }
        }
      });

      observer.observe(videoList, { subtree: true, childList: true });
    } else {
      setTimeout(applyFilters, 2000);
    }
  };

  applyFilters();

  useEffect(() => {
    console.log("🤯 Url changed");
    applyFilters();
  }, [currentUrl]);

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
