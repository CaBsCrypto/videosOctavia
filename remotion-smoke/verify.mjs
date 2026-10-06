import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const probe = JSON.parse(await readFile(process.argv[2], 'utf8'));
const videos = probe.streams.filter((stream) => stream.codec_type === 'video');
assert.equal(videos.length, 1, 'Expected one video stream');
assert.equal(probe.streams.some((stream) => stream.codec_type === 'audio'), false, 'Expected no audio');
const video = videos[0];
assert.equal(video.width, 640);
assert.equal(video.height, 360);
assert.equal(Number(video.nb_read_frames), 60, 'Decoded frame count must be 60');
const [numerator, denominator] = video.avg_frame_rate.split('/').map(Number);
assert.equal(numerator / denominator, 30);
assert.ok(Math.abs(Number(probe.format.duration) - 2) < 0.05, 'Expected 2 seconds');
console.log('Verified 60 decoded frames, 30 fps, 640x360, 2 seconds, no audio');
