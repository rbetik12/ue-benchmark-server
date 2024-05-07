const arraySum = (array) => {
    const sum = array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum
}

const averageData = (runData) => {
    let fps = []
    let cpu_time = []
    let gpu_time = []
    let memops_amount = []
    let mem_amount = []

    for (const sample of runData) {
        fps.push(sample['fps'])
        cpu_time.push(sample['cpuTime'])
        gpu_time.push(sample['gpuTime'])
        memops_amount.push(sample['memopsAmount'])
        mem_amount.push(sample['memAmount'])
    }

    fps.shift();
    cpu_time.shift();
    gpu_time.shift();
    memops_amount.shift();
    mem_amount.shift();

    let avgData = {};
    avgData['fps'] = arraySum(fps) / fps.length
    avgData['cpuTime'] = arraySum(cpu_time) / cpu_time.length
    avgData['gpuTime'] = arraySum(gpu_time) / gpu_time.length
    avgData['memopsAmount'] = arraySum(memops_amount) / memops_amount.length
    avgData['memAmount'] = arraySum(mem_amount) / mem_amount.length

    return [avgData];
}

const zNormalize = (array) => {
    const mean = array.reduce((acc, val) => acc + val, 0) / array.length;

    const stdDev = Math.sqrt(array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length);

    const normalizedArray = array.map(val => (val - mean) / stdDev);

    return normalizedArray;
}

const score = (runData) => {
    let fps = []
    let cpu_time = []
    let gpu_time = []
    let memops_amount = []
    let mem_amount = []

    for (const sample of runData) {
        fps.push(sample['fps'])
        cpu_time.push(sample['cpuTime'])
        gpu_time.push(sample['gpuTime'])
        memops_amount.push(sample['memopsAmount'])
        mem_amount.push(sample['memAmount'])
    }

    fps.shift();
    cpu_time.shift();
    gpu_time.shift();
    memops_amount.shift();
    mem_amount.shift();
}

module.exports = {
    averageData,
    score
};