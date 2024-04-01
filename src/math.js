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
        cpu_time.push(sample['cpu_time'])
        gpu_time.push(sample['gpu_time'])
        memops_amount.push(sample['memops_amount'])
        mem_amount.push(sample['mem_amount'])
    }

    let avgData = {};
    avgData['fps'] = arraySum(fps) / fps.length
    avgData['cpu_time'] = arraySum(cpu_time) / cpu_time.length
    avgData['gpu_time'] = arraySum(gpu_time) / gpu_time.length
    avgData['memops_amount'] = arraySum(memops_amount) / memops_amount.length
    avgData['mem_amount'] = arraySum(mem_amount) / mem_amount.length

    return avgData;
}

module.exports = {
    averageData
};