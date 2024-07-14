import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import styles from "./StatsForm.module.css";

function StatsForm() {
  const { register, control, handleSubmit, watch, reset } = useForm();
  const playerName = watch("playerName");
  const clanName = watch("clanName");
  const kills = watch("kills") || [];
  const damages = watch("damages") || [];
  const accuracies = watch("accuracies") || [];
  const events = Number(watch("events")) || 0;

  const [players, setPlayers] = useState([]);
  const [sortKey, setSortKey] = useState("totalKills");

  // Set up useFieldArray for kills
  const {
    fields: killFields,
    append: appendKill,
    remove: removeKill,
  } = useFieldArray({
    control,
    name: "kills",
  });

  // Set up useFieldArray for damages
  const {
    fields: damageFields,
    append: appendDamage,
    remove: removeDamage,
  } = useFieldArray({
    control,
    name: "damages",
  });

  // Set up useFieldArray for accuracies
  const {
    fields: accuracyFields,
    append: appendAccuracy,
    remove: removeAccuracy,
  } = useFieldArray({
    control,
    name: "accuracies",
  });

  // Load players from local storage when the component mounts
  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem("players")) || [];
    setPlayers(storedPlayers);
  }, []);

  // Save players to local storage whenever players state changes
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  // Function to handle form submission
  const onSubmit = (data) => {
    if (
      events !== kills.length ||
      events !== damages.length ||
      events !== accuracies.length
    ) {
      alert(
        "The number of events must match the number of kills, damages, and accuracies entered."
      );
      return;
    }

    const totalKills = calculateTotalKills(kills);
    const averageDamage = calculateAverageDamage(damages);
    const averageAccuracy = calculateAverageAccuracy(accuracies);
    const killsPerEvent = events > 0 ? (totalKills / events).toFixed(2) : 0;

    const existingPlayerIndex = players.findIndex(
      (player) => player.playerName === data.playerName && player.clanName === data.clanName
    );

    if (existingPlayerIndex !== -1) {
      // Update existing player
      const updatedPlayer = {
        ...players[existingPlayerIndex],
        totalKills: players[existingPlayerIndex].totalKills + totalKills,
        averageDamage: (
          (players[existingPlayerIndex].averageDamage * players[existingPlayerIndex].events + totalKills) /
          (players[existingPlayerIndex].events + events)
        ).toFixed(2),
        averageAccuracy: (
          (players[existingPlayerIndex].averageAccuracy * players[existingPlayerIndex].events + averageAccuracy) /
          (players[existingPlayerIndex].events + events)
        ).toFixed(2),
        events: players[existingPlayerIndex].events + events,
      };

      const updatedPlayers = [...players];
      updatedPlayers[existingPlayerIndex] = updatedPlayer;
      setPlayers(updatedPlayers);
    } else {
      // Add new player
      const newPlayer = {
        playerName: data.playerName,
        clanName: data.clanName,
        totalKills,
        killsPerEvent,
        averageDamage: averageDamage.toFixed(2),
        averageAccuracy: averageAccuracy.toFixed(2),
        events,
      };

      setPlayers([...players, newPlayer]);
    }

    reset(); // Reset form after submission
  };

  // Function to calculate total kills
  const calculateTotalKills = (kills) => {
    return kills.reduce((total, kill) => {
      const num = Number(kill.value);
      return !isNaN(num) ? total + num : total;
    }, 0);
  };

  // Function to calculate average damage
  const calculateAverageDamage = (damages) => {
    if (damages.length === 0) return 0;
    const totalDamage = damages.reduce((total, damage) => {
      const num = Number(damage.value);
      return !isNaN(num) ? total + num : total;
    }, 0);
    return totalDamage / damages.length;
  };

  // Function to calculate average accuracy
  const calculateAverageAccuracy = (accuracies) => {
    if (accuracies.length === 0) return 0;
    const totalAccuracy = accuracies.reduce((total, accuracy) => {
      const num = Number(accuracy.value);
      return !isNaN(num) ? total + num : total;
    }, 0);
    return totalAccuracy / accuracies.length;
  };

  // Function to sort players by a given key
  const sortPlayers = (key) => {
    const sortedPlayers = [...players].sort((a, b) => b[key] - a[key]);
    setPlayers(sortedPlayers);
  };

  return (
    <div>
      {/* Section for container */}
      <section className={styles.container}>
        {/* Form Section Container */}
        <section className={styles.form_container}>
          <div className={styles.header}>
            <img src="./assets/images/ABR.PNG" alt="ABC logo" />
            <h1>ABC Tourney Assistant</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <input
              type="text"
              placeholder="Player name"
              className={styles.input}
              {...register("playerName")}
            />

            <input
              type="text"
              placeholder="Clan Name"
              className={styles.input}
              {...register("clanName")}
            />

            <div className={styles.kills}>
              <h2>Kills</h2>
              {killFields.map((field, index) => (
                <div key={field.id} className={styles.killInput}>
                  <input
                    type="number"
                    placeholder={`Kill ${index + 1}`}
                    className={styles.input}
                    {...register(`kills.${index}.value`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeKill(index)}
                    className={styles.remove}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendKill({ value: "" })}
                className={styles.button}
              >
                Add Kill
              </button>
            </div>

            <div>
              <h2>Damage</h2>
              {damageFields.map((field, index) => (
                <div key={field.id} className={styles.damageInput}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Damage ${index + 1}`}
                    className={styles.input}
                    {...register(`damages.${index}.value`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeDamage(index)}
                    className={styles.remove}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendDamage({ value: "" })}
                className={styles.button}
              >
                Add Damage
              </button>
            </div>

            <div>
              <h2>Accuracy</h2>
              {accuracyFields.map((field, index) => (
                <div key={field.id} className={styles.accuracyInput}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Accuracy ${index + 1}`}
                    className={styles.input}
                    {...register(`accuracies.${index}.value`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeAccuracy(index)}
                    className={styles.remove}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendAccuracy({ value: "" })}
                className={styles.button}
              >
                Add Accuracy
              </button>
            </div>

            <div>
              <h2>Events</h2>
              <input
                type="number"
                placeholder="Number of Events"
                className={styles.input}
                {...register("events")}
              />
            </div>

            <button type="submit" className={styles.button}>
              Submit
            </button>
          </form>
        </section>

        {/* Table Section */}
        <section className={styles.table_section}>
          <h2>Player Statistics</h2>

                <div>
            <label>Sort: </label>
            <select onChange={(e) => setSortKey(e.target.value)}>
              <option value="totalKills">Total Kills</option>
              <option value="killsPerEvent">Kills per Event</option>
              <option value="averageDamage">Average Damage</option>
              <option value="averageAccuracy">Average Accuracy</option>
            </select>
            <button
              onClick={() => sortPlayers(sortKey)}
              className={styles.sortbutton}
            >
              Sort
            </button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Clan Name</th>
                <th>Total Kills</th>
                <th>Kills per Event</th>
                <th>Average Damage</th>
                <th>Average Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>{player.playerName}</td>
                  <td>{player.clanName}</td>
                  <td>{player.totalKills}</td>
                  <td>{player.killsPerEvent}</td>
                  <td>{player.averageDamage}</td>
                  <td>{player.averageAccuracy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
      <p className={styles.attribution}>
        Property of the African Battle Royale Community, A.B.C.
      </p>
    </div>
  );
}

export default StatsForm;
