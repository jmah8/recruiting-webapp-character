import { useState } from "react";
import "./App.css";
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from "./consts.js";
import { useEffect } from "react";

function App() {
  const MAX_ATTRIBUTE_POINTS = 70;

  const [attributes, setAttributes] = useState(
    ATTRIBUTE_LIST.reduce((a, v) => ({ ...a, [v]: 10 }), {}),
  );
  const [abilityModifiers, setAbilityModifiers] = useState(
    ATTRIBUTE_LIST.reduce((a, v) => ({ ...a, [v]: 0 }), {}),
  );
  const [skills, setSkills] = useState(
    SKILL_LIST.reduce((a, v) => ({ ...a, [v["name"]]: 0 }), {}),
  );
  const [selectedClass, setSelectedClass] = useState(null);

  const updateAttribute = (attributeToUpdate, increase) => {
    let newAttributes = { ...attributes };
    let usedAttributeCount = 0;
    for (const points of Object.values(attributes)) {
      usedAttributeCount += points;
    }

    if (increase && usedAttributeCount + 1 <= MAX_ATTRIBUTE_POINTS) {
      newAttributes[attributeToUpdate] += 1;
    } else if (!increase) {
      newAttributes[attributeToUpdate] -= 1;
    } else {
      alert(`Max attribute point used (${MAX_ATTRIBUTE_POINTS})`);
    }
    setAttributes(newAttributes);
  };

  const isMeetClassRequirements = (cls) => {
    let meetRequirements = true;
    let classReqs = CLASS_LIST[cls];

    for (let att of ATTRIBUTE_LIST) {
      if (attributes[att] < classReqs[att]) {
        meetRequirements = false;
        break;
      }
    }

    return meetRequirements;
  };

  const onClickedClass = (cls) => {
    setSelectedClass(cls);
  };

  const calculateSkillPointsAvailable = () => {
    return 10 + 4 * abilityModifiers["Intelligence"];
  };

  const updateSkills = (skill, increase) => {
    let newSkills = { ...skills };
    let usedSkillPoints = 0;
    for (const points of Object.values(skills)) {
      usedSkillPoints += points;
    }

    if (increase && usedSkillPoints + 1 <= calculateSkillPointsAvailable()) {
      newSkills[skill] += 1;
    } else if (!increase) {
      newSkills[skill] += -1;
    } else {
      alert(`Max skill points used (${calculateSkillPointsAvailable()})`);
    }
    setSkills(newSkills);
  };

  const getCharacter = async () => {
    let response = await fetch(
      "https://recruiting.verylongdomaintotestwith.ca/api/{{jmah8}}/character",
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        method: "GET",
      },
    );
    const json = await response.json();

    setAttributes(json["body"]["attributes"]);
    setSkills(json["body"]["skills"]);
    setSelectedClass(json["body"]["selectedClass"]);
  };

  const saveCharacter = async () => {
    await fetch(
      "https://recruiting.verylongdomaintotestwith.ca/api/{{jmah8}}/character",
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        method: "POST",
        body: JSON.stringify({
          // Only need to save attributes, clicked class and skills
          // ability modifier can be calculate
          attributes: attributes,
          skills: skills,
          selectedClass: selectedClass,
        }),
      },
    );
  };

  useEffect(() => {
    let newAbilityModifiers = {};

    for (let [att, val] of Object.entries(attributes)) {
      newAbilityModifiers[att] = Math.floor((val - 10) / 2);
    }
    setAbilityModifiers(newAbilityModifiers);
  }, [attributes]);

  useEffect(() => {
    getCharacter();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <h2>Attributes</h2>
        {ATTRIBUTE_LIST.map((att) => (
          <div key={att}>
            <p>
              {att} {attributes[att]}
            </p>
            <button onClick={() => updateAttribute(att, true)}>+</button>
            <button onClick={() => updateAttribute(att, false)}>-</button>
          </div>
        ))}
      </section>
      <section>
        <h2>Classes</h2>
        {Object.keys(CLASS_LIST).map((cls) => (
          <div key={cls}>
            <p
              onClick={() => onClickedClass(cls)}
              style={isMeetClassRequirements(cls) ? { color: "red" } : {}}
            >
              {cls}
            </p>
          </div>
        ))}
      </section>
      {selectedClass && (
        <section>
          <h2>{selectedClass} Minimum Requirements</h2>
          {Object.entries(CLASS_LIST[selectedClass]).map(([att, val], idx) => (
            <div key={selectedClass + idx}>
              <p>{att}</p>
              <p>{val}</p>
            </div>
          ))}
        </section>
      )}
      <section>
        <h2>Skills</h2>
        <div>
          {SKILL_LIST.map((skillInfo) => {
            const skillName = skillInfo["name"];
            const skillModifier = skillInfo["attributeModifier"];
            const skillPoints = skills[skillName];
            const abilityModifier = abilityModifiers[skillModifier];
            return (
              <div key={skillName}>
                <p>
                  {skillName} - points: {skillPoints}. Modifier {skillModifier}{" "}
                  : {abilityModifier}. Total: + {skillPoints + abilityModifier}
                </p>
                <button onClick={() => updateSkills(skillInfo["name"], true)}>
                  +
                </button>
                <button onClick={() => updateSkills(skillInfo["name"], false)}>
                  -
                </button>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h2>Save Character</h2>
        <button onClick={() => saveCharacter()}>Save</button>
      </section>
    </div>
  );
}

export default App;
