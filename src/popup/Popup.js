import { useEffect, useRef, useState } from "react";
import Checkbox from "./components/Checkbox";

function Popup() {
  const [wordStatus, setWordStatus] = useState(true);
  const [channelStatus, setChannelStatus] = useState(true);

  const [data, setData] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("invisible", (items) => {
      setData(items["invisible"]);
    });
  }, []);

  const wordsRef = useRef();
  const channelsRef = useRef();

  useEffect(() => {
    console.log(data);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "popup",
        cmd: "apply-filters",
        data: data,
        wordStatus: wordStatus,
        channelStatus: channelStatus,
      });
    });

    if (data.length !== 0) {
      wordsRef.current.value = data[0].join("\r\n");
      channelsRef.current.value = data[1].join("\r\n");
    }
  }, [data]);

  const handleSubmit = () => {
    let words = wordsRef.current.value.split(/\r?\n/);
    let channels = channelsRef.current.value.split(/\r?\n/);

    words = words.map((word) => word.trim());
    channels = channels.map((channel) => channel.trim());

    chrome.storage.local.set({ invisible: [words, channels] }, () => {
      console.log("saved");
    });

    setData([words, channels]);
  };

  return (
    <>
      <div id="invisibility-cloak">
        <div className="section">
          <Checkbox label={"Filter videos by words"}></Checkbox>
          <div className="textbox-container" id="words">
            <textarea
              name="words"
              id={"words-text-box"}
              ref={wordsRef}
              cols="30"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div className="section">
          <Checkbox label={"Filter videos by channel"}></Checkbox>
          <div className="textbox-container" id="channel">
            <textarea
              name={"channel"}
              id={"channel-text-box"}
              ref={channelsRef}
              cols="30"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div id="submit" onClick={handleSubmit}>
          Save Changes
        </div>
      </div>
    </>
  );
}

export default Popup;
