import spellData from './spellData.js';


export default async function castSpell(targetType, targetName, spellName, spellData) {
  console.log(spellName, castSpell);
  if (spellName.length > 0 && castSpell.length > 0) {

    // check if buddy is not logged in, if so cast spell directly
    if (this.bp.me === 'Guest' || !this.bp.me) {

      let data = {
        spell: spellName,
        targetType,
        target: targetName,
        type: spellData.type,
        config: spellData.config || {}
      }
      await runSpell.call(this, data);
      return;

    }

    // if Buddy fails role check, reflect the spell back onto them
    let result;
    try {
      result = await this.client.apiRequest(`/spellbook/cast-spell/${targetType}/${targetName}/${spellName}`, 'POST', spellData)
    } catch (err) {
      console.error('Error casting spell:', err);
      result = {
        error: err.message
      };
      if (err.message === 'HTTP error! status: 401') {
        result.error = 'Please log in to cast spells.';
      }

    }
    console.log('castSpell result', result);
    return result;
  }
}

async function runSpell(data) {
    // dynamically import the spell
    try {
        let spellModule = await this.bp.importModule(`/v5/apps/based/spellbook/spells/${data.spell}/${data.spell}.js`, {}, false);
        spellModule.default.call(this);
    }
    catch (error) {
        console.log('Error importing spell module:', error);
    }
}
