import { Points } from './classes/points';
import './render';
import { startProcessing } from './forces';
import { addConsoleApi } from './utils/addConsoleApi';
import './ui/main'

Points.init()

void startProcessing();

addConsoleApi();