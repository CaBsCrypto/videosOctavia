import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

const Smoke = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: '#101828', color: '#fff', fontFamily: 'sans-serif', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#32d583', transform: `translateX(${frame * 3 - 90}px)`}} />
      <h1 style={{fontSize: 40}}>videosOctavia smoke</h1>
      <p style={{fontSize: 24}}>Frame {frame + 1} / 60</p>
    </AbsoluteFill>
  );
};

const Root = () => <Composition id="Smoke" component={Smoke} width={640} height={360} fps={30} durationInFrames={60} />;
registerRoot(Root);
