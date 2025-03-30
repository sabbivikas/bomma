
import React from 'react';

const RunningHuman: React.FC = () => {
  return (
    <div className="running-human-container absolute">
      {/* Running person */}
      <div className="running-human">
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 10C17.7614 10 20 7.76142 20 5C20 2.23858 17.7614 0 15 0C12.2386 0 10 2.23858 10 5C10 7.76142 12.2386 10 15 10Z" fill="black"/>
          <path d="M15 12C13.5 12 11.5 12.5 10 13.5C8.5 14.5 8 16 8 17.5C8 19 8 22 8 22L12 20V40H16V24L23 26V18L16 16C16 16 16.5 14.5 18 14.5C19.5 14.5 22 16 22 16V12C22 12 19.5 12 18 12H15Z" fill="black"/>
        </svg>
      </div>
      
      {/* Running dog/puppy */}
      <div className="running-puppy" style={{ position: 'absolute', left: '40px', top: '25px' }}>
        <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 8C8.5 8 9.5 6.5 9.5 5C9.5 3.5 8.5 2 7 2C5.5 2 4.5 3.5 4.5 5C4.5 6.5 5.5 8 7 8Z" fill="black"/>
          <path d="M30 8C30 8 27 2 22 2C17 2 16 8 13 8C10 8 9 6 7 6C5 6 0 8 0 8V10C0 10 4 8 6 8C8 8 10 10 12 10C14 10 16 4 22 4C28 4 28 10 28 10L30 8Z" fill="black"/>
          <path d="M6 8L4 16" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          <path d="M26 8L28 16" stroke="black" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

export default RunningHuman;
