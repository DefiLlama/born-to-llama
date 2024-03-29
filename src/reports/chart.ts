import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export async function draw(configuration:any, {
    width = 800,
    height = 400,
}={}, backgroundColour?:string) { // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const image = await chartJSNodeCanvas.renderToBuffer(configuration, `image/png`);
    return image
}