// components/helpers/adjustBalances.ts

import { db } from "@/firebaseConfig";
import { get, ref, update } from "firebase/database";

export async function adjustBalancesForDate(
  mealDate: string,
  prices: { breakfast: number; lunch: number; dinner: number }
) {
  const usersRef = ref(db, "users");
  const adjustmentRef = ref(db, `adjustments/${mealDate}`);
  const snapshot = await get(adjustmentRef);

  if (snapshot.exists()) {
    alert("Adjustments already made for today.");
    return;
  }

  const userSnapshot = await get(usersRef);
  if (!userSnapshot.exists()) {
    alert("No users found.");
    return;
  }

  const users = userSnapshot.val();
  const updates: Record<string, any> = {};
  const failedUsers: string[] = [];

  for (const uid in users) {
    const user = users[uid];
    const meals = user?.meals?.[mealDate];
    if (!meals) continue;

    let total = 0;
    if (meals.breakfast) total += Number(prices.breakfast);
    if (meals.lunch) total += Number(prices.lunch);
    if (meals.dinner) total += Number(prices.dinner);

    const prevBalance = Number(user.balance) || 0;
    const newBalance = prevBalance - total;

    if (newBalance < 0) {
      failedUsers.push(user.name || uid);
      continue;
    }

    // Update balance
    updates[`users/${uid}/balance`] = newBalance;

    // Save adjustment record
    updates[`adjustments/${mealDate}/details/${uid}`] = {
      previousBalance: prevBalance,
      cost: total,
      newBalance,
      meals,
    };
  }

  // Mark adjustment as done
  updates[`adjustments/${mealDate}/adjusted`] = true;

  // Single update call
  await update(ref(db), updates);

  if (failedUsers.length > 0) {
    alert(
      `Adjusted most users, but skipped due to low balance:\n${failedUsers.join(
        ", "
      )}`
    );
  } else {
    alert("Balances adjusted successfully.");
  }
}
