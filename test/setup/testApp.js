// @flow

import {Container} from 'constitute';
import createApp from '../../src/app';
import settings from './settings';
import getDefaultContainer from './getDefaultContainer';

const container = getDefaultContainer();

const app = createApp(container, settings);
(app: any).container = container;

export default app;
