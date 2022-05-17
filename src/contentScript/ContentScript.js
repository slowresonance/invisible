import { useEffect, useState } from "react";

const getFlag = () => {
  if (document.location.href === "https://www.youtube.com/") return 0;
  if (document.location.href.includes("https://www.youtube.com/watch?"))
    return 1;
};

function ContentScript() {
  const [data, setData] = useState([["at"], ["dean", "blue", "kylelandry"]]);
  const queries = [
    ["", ""],
    ["#video-title", "#text-container > yt-formatted-string"],
  ];
  const [flag, setFlag] = useState(getFlag());

  let wordReg = new RegExp("a^");
  let channelReg = new RegExp("a^");
  let videoCount = 0;

  // YouTube doesn't reload its pages, it replaces the history state
  // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes

  let previousUrl = document.location.href;

  window.onload = function () {
    let bodyList = document.querySelector("body");

    let observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (previousUrl !== document.location.href) {
          previousUrl = document.location.href;
          console.log(document.location.href);
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
    console.log(flag);
  }, [flag]);

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

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.cmd) {
      case "apply-filters":
        console.log(msg);
        break;
    }
  });

  const filterByTitle = (video, queries) => {
    if (wordReg.test(video.querySelector("#video-title").title)) return true;
    return false;
  };

  const filterByChannel = (video) => {
    if (
      channelReg.test(
        video.querySelector("#text-container > yt-formatted-string").innerHTML
      )
    )
      return true;
    return false;
  };

  const applyFilters = () => {
    const selector = "#items > ytd-item-section-renderer > #contents";
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
          if (filterByChannel(video) || filterByTitle(video)) {
            videoCount -= 1;
            console.log(
              video.querySelector("#video-title").title,
              video.querySelector("#text-container > yt-formatted-string")
                .innerHTML
            );
            video.remove();
          }
        }
      });

      observer.observe(videoList, { subtree: true, childList: true });
    } else {
      setTimeout(applyFilters, 2000);
    }
  };

  applyFilters();

  // const getVideoList = () => {
  //   const selector = "#items > ytd-item-section-renderer > #contents";
  //   if (document.querySelector(selector)) {
  //     const videoList = document.querySelector(selector);
  //     var filterstrings = [" piano ", " adele ", " at "];
  //     var regex = new RegExp(filterstrings.join("|"), "i");

  //     const observer = new MutationObserver(() => {
  //       const els = document
  //         .querySelector(selector)
  //         .getElementsByTagName("ytd-compact-video-renderer");

  //       for (let el of els) {
  //         if (regex.test(el.querySelector("#video-title").title)) {
  //           el.style.background = "#ff0000";
  //         }
  //       }
  //     });

  //     observer.observe(videoList, { subtree: true, childList: true });
  //   } else {
  //     setTimeout(getVideoList, 2000);
  //   }
  // };

  // getVideoList();

  return <></>;
}

export default ContentScript;
