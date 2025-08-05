import dayjs from "dayjs";

const views = (
  adSnap: FirebaseFirestore.DocumentSnapshot<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >
) => {
  const today = dayjs().format("YYYY-MM-DD");
  let views = 0;
  if (adSnap.exists && adSnap.data().date === today) {
    views = adSnap.data().count || 0;
  }

  return {views, today};
};

export default views;
