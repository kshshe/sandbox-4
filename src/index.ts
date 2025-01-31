import { Points } from './classes/points';
import './render';
import { startProcessing } from './forces';
import { addConsoleApi } from './utils/addConsoleApi';
import './ui/main'
import 'react-tooltip/dist/react-tooltip.css'

Points.init()

void startProcessing();

addConsoleApi();