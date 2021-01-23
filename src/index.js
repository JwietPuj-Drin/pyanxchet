import Qieyun from 'qieyun';
import StringLogger from './string-logger.js';
import 生成擬音 from './autoderiver/index.js';

export { default as Qieyun } from 'qieyun';

const logger = new StringLogger();

const 重紐母 = '幫滂並明見溪羣疑影曉';
const 重紐韻 = '支脂祭眞仙宵清侵鹽';

const 必為開口的韻 = '咍痕欣嚴之魚臻蕭宵肴豪侯侵覃談鹽添咸銜';
const 必為合口的韻 = '灰魂文凡';
const 開合中立的韻 = '東冬鍾江虞模尤幽';

const 一等韻 = '冬模泰咍灰痕魂寒豪唐登侯覃談';
const 二等韻 = '江佳皆夬刪山肴耕咸銜';
const 三等韻 = '鍾支脂之微魚虞祭廢眞臻欣元文仙宵陽清蒸尤幽侵鹽嚴凡';
const 四等韻 = '齊先蕭青添';
const 一三等韻 = '東歌';
const 二三等韻 = '麻庚';

function 生成音韻地位説明(音韻地位) {
  const { 代表字 } = 音韻地位;
  if (代表字 == null) {
    return '（無對應字）';
  }
  const 反切 = 音韻地位.反切(代表字);
  if (反切 == null) {
    return `（${代表字}）`;
  }
  return `（${代表字}，${反切}切）`;
}

const 上字母到被切字母們 = {
  // 端知
  端: ['端', '知'],
  透: ['透', '徹'],
  定: ['定', '澄'],
  泥: ['泥', '孃'],
  知: ['端', '知'],
  徹: ['透', '徹'],
  澄: ['定', '澄'],
  孃: ['泥', '孃'],
  // 云匣
  云: ['云', '匣'],
  匣: ['云', '匣'],
};

const 母到對應的等們 = {
  幫: ['一', '二', '三', '四'],
  滂: ['一', '二', '三', '四'],
  並: ['一', '二', '三', '四'],
  明: ['一', '二', '三', '四'],
  端: ['一', '四'],
  透: ['一', '四'],
  定: ['一', '四'],
  泥: ['一', '四'],
  來: ['一', '二', '三', '四'],
  知: ['二', '三'],
  徹: ['二', '三'],
  澄: ['二', '三'],
  孃: ['二', '三'],
  精: ['一', '三', '四'],
  清: ['一', '三', '四'],
  從: ['一', '三', '四'],
  心: ['一', '三', '四'],
  邪: ['一', '三', '四'],
  莊: ['二', '三'],
  初: ['二', '三'],
  崇: ['二', '三'],
  生: ['二', '三'],
  俟: ['二', '三'],
  章: ['三'],
  昌: ['三'],
  常: ['三'],
  書: ['三'],
  船: ['三'],
  日: ['三'],
  見: ['一', '二', '三', '四'],
  溪: ['一', '二', '三', '四'],
  羣: ['三'],
  疑: ['一', '二', '三', '四'],
  影: ['一', '二', '三', '四'],
  曉: ['一', '二', '三', '四'],
  匣: ['一', '二', '四'],
  云: ['三'],
  以: ['三'],
};

/**
 * @param {Qieyun.音韻地位} 上字音韻地位
 * @param {Qieyun.音韻地位} 下字音韻地位
 */
function 確定母們(上字音韻地位, 下字音韻地位) {
  const 上字母 = 上字音韻地位.母;
  const 被切字母們 = null; // TODO: 處理類隔：上字母到被切字母們[上字母];
  if (被切字母們 == null) {
    const 被切字母 = 上字母;
    logger.log(`規則 3.1: 上字為${上字母}母，故被切字為${被切字母}母`);
    return [被切字母];
  }
  logger.log(`規則 3.2: 上字為${上字母}母，被切字可能為${被切字母們.join('、')}母`);
  return 被切字母們;
}

/**
 * @param {Qieyun.音韻地位} 上字音韻地位
 * @param {Qieyun.音韻地位} 下字音韻地位
 */
function 確定重紐們(上字音韻地位, 下字音韻地位) {
  if (上字音韻地位.屬於('重紐A類')) {
    logger.log('規則 4.4: 上字為重紐A類，被切字為重紐A類');
    return ['A'];
  }
  if (上字音韻地位.屬於('重紐B類')) {
    logger.log('規則 4.5: 上字為重紐B類，被切字為重紐B類');
    return ['B'];
  }
  if (下字音韻地位.屬於('重紐A類 或 以母 或 精組')) {
    logger.log('規則 4.6: 下字為重紐A類、以母或精組，被切字為重紐A類');
    return ['A'];
  }
  if (下字音韻地位.屬於('重紐B類 云母')) {
    logger.log('規則 4.7: 下字為重紐B類或云母，被切字為重紐B類');
    return ['B'];
  }
  logger.log('規則 4.8: 不能確定重紐，可能為重紐A類或B類');
  return ['A', 'B']
}

/**
 * @param {Qieyun.音韻地位} 上字音韻地位
 * @param {Qieyun.音韻地位} 下字音韻地位
 */
function 確定等們(上字音韻地位, 下字音韻地位) {
  if (下字音韻地位.屬於('三等')) {
    logger.log('規則 5.1: 下字為三等，故被切字為三等');
    return ['三'];
  }
  if (!上字音韻地位.屬於('三等') && !下字音韻地位.屬於('三等')) {
    logger.log('規則 5.2: 上下字均為非三等，故被切字為非三等');
    return ['一', '二', '四'];
  }
  logger.log('規則 5.3: 無法根據反切上下字的等確定被切字等');
  return ['一', '二', '三', '四'];
}

/**
 * @param {Qieyun.音韻地位} 上字音韻地位
 * @param {Qieyun.音韻地位} 下字音韻地位
 */
function 確定被切字開合們(上字音韻地位, 下字音韻地位) {
  if (上字音韻地位.屬於('開口') && 下字音韻地位.屬於('開口')) {
    logger.log('規則 6.3: 反切上下字均為開口，故被切字為開口');
    return ['開'];
  }
  if (下字音韻地位.屬於('合口')) {
    logger.log('規則 6.4: 下字為合口，故被切字為合口');
    return ['合'];
  }
  if (上字音韻地位.屬於('合口') && 下字音韻地位.屬於('幫組')) {
    logger.log('規則 6.5: 上字為合口，下字為幫組，故被切字為合口');
    return ['合'];
  }
  logger.log('規則 6.6: 無法根據反切上下字的開合確定被切字開合，被切字可能為開口或合口');
  return ['開', '合'];
}

/**
 * @param {string} 上字
 * @param {string} 下字
 * @param {Qieyun.音韻地位} 上字音韻地位
 * @param {Qieyun.音韻地位} 下字音韻地位
 */
export function pyanxchet(上字, 下字, 上字音韻地位, 下字音韻地位) {
  logger.tick();

  logger.log(`${上字}${下字}切`);
  logger.log(`${上字}: ${上字音韻地位.表達式.split(' ').join('、')}${生成擬音(上字音韻地位)}`);
  logger.log(`${下字}: ${下字音韻地位.表達式.split(' ').join('、')}${生成擬音(下字音韻地位)}`);
  //${生成擬音(上字音韻地位)}

  // 1. 確定韻
  const 下字韻 = 下字音韻地位.韻;
  const 被切字韻 = 下字韻;
  logger.log(`規則 1.1: 下字為${下字韻}韻，故被切字為${被切字韻}韻`);

  // 2. 確定聲
  const 下字聲 = 下字音韻地位.聲;
  const 被切字聲 = 下字聲;
  logger.log(`規則 2.1: 下字為${下字聲}聲，故被切字為${被切字聲}聲`);

  // 3. 確定母
  const 被切字母們 = 確定母們(上字音韻地位, 下字音韻地位);
  // 必然符合以下條件：
  // 條件 3.1：「被切字母們」不空
  // 條件 3.2：若「首個被切字母」是重紐母，則「被切字母們」全是重紐母，反之亦然
  // 條件 3.3：若「首個被切字母」是脣音，則「被切字母們」全是脣音，且長度必為 1；反之則全不是脣音
  const 首個被切字母 = 被切字母們[0];

  // 4. 確定重紐
  let 被切字重紐們;
  if (![...重紐韻].includes(被切字韻)) {
    logger.log(`規則 4.1: ${被切字韻}韻無重紐，故無須確定重紐`);
    被切字重紐們 = [null];
  } else if (![...重紐母].includes(首個被切字母)) { // 參照條件 3.2，首個被切字母可以代表全部被切字
    if (被切字母們.length == 1) {
      logger.log(`規則 4.2: ${首個被切字母}母無重紐，故無須確定重紐`);
    } else {
      logger.log(`規則 4.3: ${被切字母們.join('、')}母均無重紐，故無須確定重紐`);
    }
    被切字重紐們 = [null];
  } else {
    被切字重紐們 = 確定重紐們(上字音韻地位, 下字音韻地位);
  }

  // 5. 確定等
  let 被切字等們 = 確定等們(上字音韻地位, 下字音韻地位);

  // 6. 確定開合
  let 被切字開合們;
  // 條件 6.1：「被切字開合們」只能出現以下兩種情況：1. 為 [null]，2. 全不為 null
  if ([...'幫滂並明'].includes(首個被切字母)) { // 參照條件 3.3，首個被切字母可以代表全部被切字
    if (被切字母們.length == 1) {
      logger.log(`規則 6.1: ${首個被切字母}母屬於脣音，開合中立，故無須確定開合`);
    } else {
      throw new Error('Never reach here.'); // 參照條件 3.3，不可能出現此種情況
    }
    被切字開合們 = [null];
  } else if ([...開合中立的韻].includes(被切字韻)) {
    logger.log(`規則 6.2: ${被切字韻}韻是開合中立的韻，故無須確定開合`);
    被切字開合們 = [null];
  } else {
    被切字開合們 = 確定被切字開合們(上字音韻地位, 下字音韻地位);
  }

  // 7. 根據韻確定開合
  if (被切字開合們.length === 1 && 被切字開合們[0] == null) {
    void(0); // 根據條件 6.1，開合中立的情況無須確定開合
  } else {
    if ([...必為開口的韻].includes(被切字韻)) {
      if (被切字開合們.length === 1 && 被切字開合們[0] === '開') {
        void(0);
      } else if (被切字開合們.length === 2) {
        logger.log(`規則 7.1: ${被切字韻}韻只能是開口`);
        被切字開合們 = ['開'];
      } else {
        logger.log(`規則 7.2: ${被切字韻}韻只能是開口`);
        被切字開合們 = [];
      }
    }

    else if ([...必為合口的韻].includes(被切字韻)) {
      if (被切字開合們.length === 1 && 被切字開合們[0] === '合') {
        void(0);
      } else if (被切字開合們.length === 2) {
        logger.log(`規則 7.3: ${被切字韻}韻只能是合口`);
        被切字開合們 = ['合'];
      } else {
        logger.log(`規則 7.4: ${被切字韻}韻只能是合口`);
        被切字開合們 = [];
      }
    }
  }

  // 8. 根據韻確定等
  if ([...一等韻].includes(被切字韻)) {
    if (被切字等們.length === 1 && 被切字等們[0] === '一') {
      void(0);
    } else if (被切字等們.length > 1 && 被切字等們.includes('一')) {
      logger.log(`規則 8.1: ${被切字韻}韻只能是一等`);
      被切字等們 = ['一'];
    } else {
      logger.log(`規則 8.2: ${被切字韻}韻只能是一等`);
      被切字等們 = [];
    }
  }

  else if ([...二等韻].includes(被切字韻)) {
    if (被切字等們.length === 1 && 被切字等們[0] === '二') {
      void(0);
    } else if (被切字等們.length > 1 && 被切字等們.includes('二')) {
      logger.log(`規則 8.3: ${被切字韻}韻只能是二等`);
      被切字等們 = ['二'];
    } else {
      logger.log(`規則 8.4: ${被切字韻}韻只能是二等`);
      被切字等們 = [];
    }
  }

  else if ([...三等韻].includes(被切字韻)) {
    if (被切字等們.length === 1 && 被切字等們[0] === '三') {
      void(0);
    } else if (被切字等們.length > 1 && 被切字等們.includes('三')) {
      logger.log(`規則 8.5: ${被切字韻}韻只能是三等`);
      被切字等們 = ['三'];
    } else {
      logger.log(`規則 8.6: ${被切字韻}韻只能是三等`);
      被切字等們 = [];
    }
  }

  else if ([...四等韻].includes(被切字韻)) {
    if (被切字等們.length === 1 && 被切字等們[0] === '四') {
      void(0);
    } else if (被切字等們.length > 1 && 被切字等們.includes('四')) {
      logger.log(`規則 8.7: ${被切字韻}韻只能是四等`);
      被切字等們 = ['四'];
    } else {
      logger.log(`規則 8.8: ${被切字韻}韻只能是四等`);
      被切字等們 = [];
    }
  }

  else if ([...一三等韻].includes(被切字韻)) {
    if (被切字等們.every((等) => ['一', '三'].includes(等))) {
      void(0);
    } else if (!被切字等們.every((等) => !['一', '三'].includes(等))) {
      logger.log(`規則 8.9: ${被切字韻}韻只能是一等或三等`);
      被切字等們 = 被切字等們.filter((等) => ['一', '三'].includes(等));
    } else {
      logger.log(`規則 8.10: ${被切字韻}韻只能是一等或三等`);
      被切字等們 = [];
    }
  }

  else if ([...二三等韻].includes(被切字韻)) {
    if (被切字等們.every((等) => ['二', '三'].includes(等))) {
      void(0);
    } else if (!被切字等們.every((等) => !['二', '三'].includes(等))) {
      logger.log(`規則 8.11: ${被切字韻}韻只能是二等或三等`);
      被切字等們 = 被切字等們.filter((等) => ['二', '三'].includes(等));
    } else {
      logger.log(`規則 8.12: ${被切字韻}韻只能是二等或三等`);
      被切字等們 = [];
    }
  }

  // 9. 根據母確定等
  if (被切字母們.length === 1) {
    const 母對應的等們 = 母到對應的等們[首個被切字母];
    const temp = 被切字等們.filter((等) => 母對應的等們.includes(等));
    if (temp.length < 被切字等們.length) {
      logger.log(`規則 9.1: ${首個被切字母}母只能是${母對應的等們.join('、')}等`);
      被切字等們 = temp;
    }
  } else {
    throw new Error('TODO: 處理類隔'); // 目前「被切字母們」長度只可能為 1，不會出現此情況
  }

  const 被切字音韻地位們 = [];
  for (const 被切字母 of 被切字母們) {
    for (const 被切字重紐 of 被切字重紐們) {
      for (const 被切字等 of 被切字等們) {
        for (const 被切字開合 of 被切字開合們) {
          被切字音韻地位們.push(new Qieyun.音韻地位(被切字母, 被切字開合, 被切字等, 被切字重紐, 被切字韻, 被切字聲));
        }
      }
    }
  }

  if (被切字音韻地位們.length === 0) {
    logger.log('無對應音節');
  } else if (被切字音韻地位們.length === 1) {
    const 當前音韻地位 = 被切字音韻地位們[0];
    logger.log(`預測被切字音韻地位: ${當前音韻地位.描述}${生成音韻地位説明(當前音韻地位)}${生成擬音(當前音韻地位)}`);
  } else {
    let i = 1;
    for (const 當前音韻地位 of 被切字音韻地位們) {
      logger.log(`預測被切字音韻地位 ${i++}: ${當前音韻地位.描述}${生成音韻地位説明(當前音韻地位)}${生成擬音(當前音韻地位)}`);
    }
  }

  const 反切過程 = logger.tock();

  return { 被切字音韻地位們, 反切過程 };
}
