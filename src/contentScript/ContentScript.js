import { useEffect, useState } from "react";

const getFlag = () => {
  if (document.location.href === "https://www.youtube.com/") return 0;
  if (document.location.href.includes("https://www.youtube.com/watch?"))
    return 1;
};

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

function ContentScript() {
  const [data, setData] = useState([[""], [""]]);

  const getRegex = () => {
    const tempReg = [];
    if (data[0].length === 1 && data[0][0] === "") {
      tempReg["word"] = new RegExp("a^");
    } else {
      tempReg["word"] = new RegExp(data[0].join("|"), "i");
    }
    if (data[1].length === 1 && data[1][0] === "") {
      tempReg["channel"] = new RegExp("a^");
    } else {
      tempReg["channel"] = new RegExp(data[1].join("|"), "i");
    }
    console.log("🛑", tempReg);
    return tempReg;
  };

  const [regex, setRegex] = useState(getRegex());
  const [flag, setFlag] = useState(getFlag());
  const [currentUrl, setCurrentUrl] = useState(document.location.href);
  const [wordStatus, setWordStatus] = useState(true);
  const [channelStatus, setChannelStatus] = useState(true);

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
    setRegex(getRegex());
    console.log("😉", data);
  }, [data, currentUrl]);

  const filterByTitle = (video) => {
    if (!video.querySelector(selectors[flag]["title"])) return false;
    if (
      regex["word"].test(
        video.querySelector(selectors[flag]["title"]).innerText
      )
    ) {
      return true;
    }
    return false;
  };

  const filterByChannel = (video) => {
    if (!video.querySelector(selectors[flag]["channel"])) return false;
    if (
      regex["channel"].test(
        video.querySelector(selectors[flag]["channel"]).innerText
      )
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
        // console.clear();
        // console.log(currentUrl);
        // console.log(data);
        // console.log(regex["word"], regex["channel"]);

        for (let video of videos) {
          video.style = "";
          if (filterByTitle(video) || filterByChannel(video)) {
            // console.log(
            //   video.querySelector(selectors[flag]["title"]).innerText.trim(),
            //   video.querySelector(selectors[flag]["channel"]).innerText.trim()
            // );
            video.style.background = "red";
            // video.style.display = "none";
          }
        }
      });

      observer.observe(videoList, { subtree: true, childList: true });
    } else {
      setTimeout(applyFilters, 100);
    }
  };

  applyFilters();

  useEffect(() => {
    applyFilters();
  }, [currentUrl]);

  const updateData = (data) => {
    if (data.length === 0) return;

    console.log("🥶", wordStatus, channelStatus);

    let tempData = [[""], [""]];
    if (wordStatus) {
      tempData[0] = [].concat(data[0]);
    }
    if (channelStatus) {
      tempData[1] = [].concat(data[1]);
    }

    console.log("🤗", tempData);
    setData(tempData);
  };

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.cmd) {
      case "apply-filters":
        setWordStatus(msg.wordStatus);
        setChannelStatus(msg.channelStatus);
        updateData(msg.data);
        applyFilters();
        console.log(msg);
        break;
    }
  });

  useEffect(() => {
    chrome.storage.local.get("invisible-word-toggle", (items) => {
      setWordStatus(items["invisible-word-toggle"]);
    });
    chrome.storage.local.get("invisible-channel-toggle", (items) => {
      setChannelStatus(items["invisible-channel-toggle"]);
    });
    chrome.storage.local.get("invisible-data", (items) => {
      updateData(items["invisible-data"]);
    });
  }, []);

  useEffect(() => {
    console.log(wordStatus, channelStatus);
  }, [wordStatus, channelStatus]);

  return <></>;
}

export default ContentScript;
