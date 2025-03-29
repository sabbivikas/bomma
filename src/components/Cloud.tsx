
import React from 'react';

const Cloud: React.FC = () => {
  return (
    <>
      <svg className="cloud cloud-1 absolute" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#sketchy)' }}>
        <defs>
          <filter id="sketchy">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        </defs>
        <path d="M10 35C4.47715 35 0 30.5228 0 25C0 19.4772 4.47715 15 10 15C10.9616 15 11.8945 15.1418 12.7803 15.4078C14.8303 7.58764 21.8492 2 30 2C39.3888 2 47.1559 9.19875 47.9168 18.4119C49.2478 17.5044 50.8362 17 52.5 17C57.1944 17 61 20.8056 61 25.5C61 30.1944 57.1944 34 52.5 34C51.1974 34 49.9522 33.7074 48.8354 33.1777C46.0872 35.5342 42.2814 37 38 37C32.9216 37 28.4207 34.7376 25.5631 31.1321C23.3466 33.7963 20.0481 35.5 16.3125 35.5C14.7698 35.5 13.3108 35.1977 12 34.6492C11.3756 34.8765 10.7022 35 10 35Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
      </svg>
      <svg className="cloud cloud-2 absolute" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#sketchy)' }}>
        <use href="#sketchy" />
        <path d="M10 35C4.47715 35 0 30.5228 0 25C0 19.4772 4.47715 15 10 15C10.9616 15 11.8945 15.1418 12.7803 15.4078C14.8303 7.58764 21.8492 2 30 2C39.3888 2 47.1559 9.19875 47.9168 18.4119C49.2478 17.5044 50.8362 17 52.5 17C57.1944 17 61 20.8056 61 25.5C61 30.1944 57.1944 34 52.5 34C51.1974 34 49.9522 33.7074 48.8354 33.1777C46.0872 35.5342 42.2814 37 38 37C32.9216 37 28.4207 34.7376 25.5631 31.1321C23.3466 33.7963 20.0481 35.5 16.3125 35.5C14.7698 35.5 13.3108 35.1977 12 34.6492C11.3756 34.8765 10.7022 35 10 35Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
      </svg>
    </>
  );
};

export default Cloud;
