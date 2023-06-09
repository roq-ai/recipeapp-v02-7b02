import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  Center,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useFormik, FormikHelpers } from 'formik';
import { getRecipeById, updateRecipeById } from 'apiSdk/recipes';
import { Error } from 'components/error';
import { recipeValidationSchema } from 'validationSchema/recipes';
import { RecipeInterface } from 'interfaces/recipe';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { AccountInterface } from 'interfaces/account';
import { getAccounts } from 'apiSdk/accounts';
import { likeValidationSchema } from 'validationSchema/likes';
import { reviewValidationSchema } from 'validationSchema/reviews';

function RecipeEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<RecipeInterface>(
    () => (id ? `/recipes/${id}` : null),
    () => getRecipeById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: RecipeInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateRecipeById(id, values);
      mutate(updated);
      resetForm();
      router.push('/recipes');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<RecipeInterface>({
    initialValues: data,
    validationSchema: recipeValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Edit Recipe
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {formError && (
          <Box mb={4}>
            <Error error={formError} />
          </Box>
        )}
        {isLoading || (!formik.values && !error) ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="name" mb="4" isInvalid={!!formik.errors?.name}>
              <FormLabel>Name</FormLabel>
              <Input type="text" name="name" value={formik.values?.name} onChange={formik.handleChange} />
              {formik.errors.name && <FormErrorMessage>{formik.errors?.name}</FormErrorMessage>}
            </FormControl>
            <FormControl id="difficulty_level" mb="4" isInvalid={!!formik.errors?.difficulty_level}>
              <FormLabel>Difficulty Level</FormLabel>
              <NumberInput
                name="difficulty_level"
                value={formik.values?.difficulty_level}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('difficulty_level', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.difficulty_level && <FormErrorMessage>{formik.errors?.difficulty_level}</FormErrorMessage>}
            </FormControl>
            <FormControl id="description" mb="4" isInvalid={!!formik.errors?.description}>
              <FormLabel>Description</FormLabel>
              <Input type="text" name="description" value={formik.values?.description} onChange={formik.handleChange} />
              {formik.errors.description && <FormErrorMessage>{formik.errors?.description}</FormErrorMessage>}
            </FormControl>
            <FormControl id="image" mb="4" isInvalid={!!formik.errors?.image}>
              <FormLabel>Image</FormLabel>
              <Input type="text" name="image" value={formik.values?.image} onChange={formik.handleChange} />
              {formik.errors.image && <FormErrorMessage>{formik.errors?.image}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<AccountInterface>
              formik={formik}
              name={'account_id'}
              label={'Select Account'}
              placeholder={'Select Account'}
              fetcher={getAccounts}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.name as any}
                </option>
              )}
            />
            <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'recipe',
  operation: AccessOperationEnum.UPDATE,
})(RecipeEditPage);
