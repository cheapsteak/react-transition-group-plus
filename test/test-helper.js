'use strict';

import {jsdom} from 'jsdom';

const document = global.document = jsdom('<html><head></head><body></body></html>');
const window = global.window = document.defaultView;
global.navigator = window.navigator = {};
