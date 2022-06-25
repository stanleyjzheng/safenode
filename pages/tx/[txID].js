export function getServerSideProps(context) {
  return {
    props: {params: context.params}
  };
}

export default ({params}) => {
  const { txID } = params;
  console.log(txID)
  return <div>You opened page with {txID}</div>;
};
