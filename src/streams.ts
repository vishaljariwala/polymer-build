/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {PassThrough, Transform} from 'stream';
import File = require('vinyl');
import * as fs from 'fs';

const multipipe = require('multipipe');

export type FileCB = (error?: any, file?: File) => void;

/**
 * Waits for the given ReadableStream
 */
export function waitFor(stream: NodeJS.ReadableStream):
    Promise<NodeJS.ReadableStream> {
  return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

/**
 * Waits for all the given ReadableStreams
 */
export function waitForAll(streams: NodeJS.ReadableStream[]):
    Promise<NodeJS.ReadableStream[]> {
  return Promise.all<NodeJS.ReadableStream>(streams.map((s) => waitFor(s)));
}

/**
 * Composes multiple streams (or Transforms) into one.
 */
export function compose(streams: NodeJS.ReadWriteStream[]) {
  if (streams && streams.length > 0) {
    return multipipe(streams);
  } else {
    return new PassThrough({objectMode: true});
  }
}

/**
 * A stream that takes file path strings, and outputs full Vinyl file objects
 * for the file at each location.
 */
export class VinylReaderTransform extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(
      filePath: string,
      _encoding: string,
      callback: (error?: Error, data?: File) => void): void {
    fs.readFile(filePath, (err?: Error, data?: Buffer) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, new File({path: filePath, contents: data}));
    });
  }
}